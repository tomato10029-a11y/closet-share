import json
import math
import os
import re
import secrets
import smtplib
import sqlite3
import ssl
import time
import uuid
from datetime import datetime
from email.message import EmailMessage
from functools import wraps
from pathlib import Path

from dotenv import load_dotenv
from flask import Flask, abort, current_app, g, jsonify, request, send_from_directory, session, url_for
from werkzeug.exceptions import HTTPException

CATEGORIES = ('면접복', '졸업·행사', '파티')
SIZES = ('S', 'M', 'L', 'XL')
ICONS = {'면접복': 'jacket', '졸업·행사': 'dress', '파티': 'sparkle'}
MAX_PRICE = 300_000
RENT_RATE = 0.1
RENT_UNIT = 100
DEPOSIT_RATE = 0.3
DEPOSIT_UNIT = 1000
DEFAULT_COND = '상태 좋음'
DEFAULT_TONE = ('#143F85', '#6C93D6')
OWNER_LABEL = '경북대 재학생'

MAX_PHOTOS = 3
MAX_UPLOAD_BYTES = 32 * 1024 * 1024
PHOTO_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp', '.gif'}

DATE_FORMAT = '%Y-%m-%d'
FIRST_STEP = 1
REQUIRED_STEP = {'handover': 1, 'return': 2, 'refund': 3}

EMAIL_DOMAIN = 'knu.ac.kr'
EMAIL_PATTERN = re.compile(r'[a-z0-9._%+-]+@knu\.ac\.kr')
CODE_DIGITS = 4
CODE_PATTERN = re.compile(rf'[0-9]{{{CODE_DIGITS}}}')
CODE_TTL_SECONDS = 10 * 60
CODE_MAX_ATTEMPTS = 5
CODE_RESEND_SECONDS = 60
SMTP_TIMEOUT_SECONDS = 10
MAIL_SUBJECT = '[동네옷장] 재학생 인증코드'
REQUIRED_SETTINGS = ('SECRET_KEY', 'SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASSWORD')

SCHEMA = """
CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    owner_email TEXT NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    size TEXT NOT NULL,
    price INTEGER NOT NULL,
    photos TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS rentals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id INTEGER NOT NULL REFERENCES items(id),
    renter_email TEXT NOT NULL,
    from_date TEXT NOT NULL,
    to_date TEXT NOT NULL,
    step INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS auth_codes (
    email TEXT PRIMARY KEY,
    code TEXT NOT NULL,
    sent_at REAL NOT NULL,
    attempts INTEGER NOT NULL
);
"""


def js_round(x):
    return math.floor(x + 0.5)


def rent_of(price):
    return js_round(price * RENT_RATE / RENT_UNIT) * RENT_UNIT


def deposit_of(price):
    return js_round(price * DEPOSIT_RATE / DEPOSIT_UNIT) * DEPOSIT_UNIT


def get_db():
    if 'db' not in g:
        g.db = sqlite3.connect(current_app.config['DATABASE'])
        g.db.row_factory = sqlite3.Row
        g.db.execute('PRAGMA foreign_keys = ON')
    return g.db


def item_json(row):
    return {
        'id': row['id'],
        'name': row['name'],
        'category': row['category'],
        'size': row['size'],
        'price': row['price'],
        'rent': rent_of(row['price']),
        'deposit': deposit_of(row['price']),
        'cond': DEFAULT_COND,
        'tone': list(DEFAULT_TONE),
        'icon': ICONS[row['category']],
        'owner': OWNER_LABEL,
        'photos': [url_for('photo', filename=f, _external=True) for f in json.loads(row['photos'])],
    }


def rental_json(row):
    return {
        'id': row['id'],
        'itemId': row['item_id'],
        'from': row['from_date'],
        'to': row['to_date'],
        'step': row['step'],
    }


def json_body():
    body = request.get_json(silent=True)
    if not isinstance(body, dict):
        abort(400, 'JSON 본문이 필요해요')
    return body


def parse_email(value):
    email = value.strip().lower() if isinstance(value, str) else ''
    if not EMAIL_PATTERN.fullmatch(email):
        abort(400, f'@{EMAIL_DOMAIN} 이메일만 사용할 수 있어요')
    return email


def parse_date(value, field):
    if not isinstance(value, str):
        abort(400, f'{field}: YYYY-MM-DD 형식의 날짜가 필요해요')
    try:
        return datetime.strptime(value, DATE_FORMAT).date()
    except ValueError:
        abort(400, f'{field}: YYYY-MM-DD 형식의 날짜가 필요해요')


def validate_item_data(raw):
    if raw is None:
        abort(400, 'data 필드(JSON)가 필요해요')
    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        abort(400, 'data 필드가 올바른 JSON이 아니에요')
    if not isinstance(data, dict):
        abort(400, 'data 필드는 JSON 객체여야 해요')

    name = data.get('name')
    if not isinstance(name, str) or not name.strip():
        abort(400, 'name이 필요해요')
    if data.get('category') not in CATEGORIES:
        abort(400, f'category는 {", ".join(CATEGORIES)} 중 하나여야 해요')
    if data.get('size') not in SIZES:
        abort(400, f'size는 {", ".join(SIZES)} 중 하나여야 해요')
    price = data.get('price')
    if not isinstance(price, int) or isinstance(price, bool) or not 0 < price <= MAX_PRICE:
        abort(400, f'price는 1 이상 {MAX_PRICE} 이하의 정수여야 해요')
    return {'name': name.strip(), 'category': data['category'], 'size': data['size'], 'price': price}


def validate_photos(files):
    if not 1 <= len(files) <= MAX_PHOTOS:
        abort(400, f'photos는 1~{MAX_PHOTOS}장이어야 해요')
    exts = []
    for f in files:
        ext = Path(f.filename or '').suffix.lower()
        if ext not in PHOTO_EXTENSIONS:
            abort(400, f'사진은 {", ".join(sorted(PHOTO_EXTENSIONS))} 파일만 올릴 수 있어요')
        exts.append(ext)
    return exts


def send_code_mail(to, code):
    cfg = current_app.config
    msg = EmailMessage()
    msg['Subject'] = MAIL_SUBJECT
    msg['From'] = cfg['SMTP_USER']
    msg['To'] = to
    msg.set_content(f'동네옷장 재학생 인증코드는 {code} 입니다.\n{CODE_TTL_SECONDS // 60}분 안에 입력해 주세요.')
    with smtplib.SMTP_SSL(cfg['SMTP_HOST'], cfg['SMTP_PORT'], timeout=SMTP_TIMEOUT_SECONDS,
                          context=ssl.create_default_context()) as smtp:
        smtp.login(cfg['SMTP_USER'], cfg['SMTP_PASSWORD'])
        smtp.send_message(msg, to_addrs=[to])


def current_email():
    return session['email']


def login_required(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        if 'email' not in session:
            abort(401, '로그인이 필요해요')
        return view(*args, **kwargs)
    return wrapped


def load_settings(app, test_config):
    load_dotenv(Path(__file__).with_name('.env'))
    app.config.update({key: os.environ.get(key) for key in REQUIRED_SETTINGS})
    if test_config:
        app.config.update(test_config)
    missing = [key for key in REQUIRED_SETTINGS if not app.config.get(key)]
    if missing:
        raise RuntimeError(f'.env에 {", ".join(missing)} 값이 없어요. .env.example을 참고하세요')
    try:
        app.config['SMTP_PORT'] = int(app.config['SMTP_PORT'])
    except ValueError:
        raise RuntimeError('.env의 SMTP_PORT는 숫자여야 해요') from None


def create_app(test_config=None):
    app = Flask(__name__)
    instance = Path(app.instance_path)
    app.config.from_mapping(
        DATABASE=str(instance / 'closet.db'),
        UPLOAD_FOLDER=str(instance / 'uploads'),
        MAX_CONTENT_LENGTH=MAX_UPLOAD_BYTES,
        SESSION_COOKIE_SAMESITE='Lax',
    )
    load_settings(app, test_config)
    app.json.ensure_ascii = False

    Path(app.config['UPLOAD_FOLDER']).mkdir(parents=True, exist_ok=True)
    Path(app.config['DATABASE']).parent.mkdir(parents=True, exist_ok=True)
    with sqlite3.connect(app.config['DATABASE']) as conn:
        conn.executescript(SCHEMA)

    @app.teardown_appcontext
    def close_db(_exc):
        db = g.pop('db', None)
        if db is not None:
            db.close()

    @app.errorhandler(HTTPException)
    def http_error(e):
        return jsonify(error=e.description), e.code

    @app.post('/api/auth/send-code')
    def send_code():
        email = parse_email(json_body().get('email'))
        db = get_db()
        now = time.time()
        row = db.execute('SELECT sent_at FROM auth_codes WHERE email = ?', (email,)).fetchone()
        if row is not None and now - row['sent_at'] < CODE_RESEND_SECONDS:
            abort(429, f'인증코드는 {CODE_RESEND_SECONDS}초에 한 번만 보낼 수 있어요')

        code = f'{secrets.randbelow(10 ** CODE_DIGITS):0{CODE_DIGITS}d}'
        try:
            send_code_mail(email, code)
        except (smtplib.SMTPException, OSError) as e:
            app.logger.error('인증 메일 발송 실패: %r', e)
            abort(502, '인증 메일을 보내지 못했어요')
        db.execute(
            'INSERT OR REPLACE INTO auth_codes (email, code, sent_at, attempts) VALUES (?, ?, ?, 0)',
            (email, code, now),
        )
        db.commit()
        return jsonify(ok=True)

    @app.post('/api/auth/verify')
    def verify_code():
        body = json_body()
        email = parse_email(body.get('email'))
        code = body.get('code')
        if not isinstance(code, str) or not CODE_PATTERN.fullmatch(code):
            return jsonify(ok=False)

        db = get_db()
        cur = db.execute(
            'UPDATE auth_codes SET attempts = attempts + 1 WHERE email = ? AND attempts < ? AND sent_at > ?',
            (email, CODE_MAX_ATTEMPTS, time.time() - CODE_TTL_SECONDS),
        )
        db.commit()
        if cur.rowcount == 0:
            return jsonify(ok=False)
        row = db.execute('SELECT code FROM auth_codes WHERE email = ?', (email,)).fetchone()
        if row is None or not secrets.compare_digest(row['code'], code):
            return jsonify(ok=False)

        db.execute('DELETE FROM auth_codes WHERE email = ?', (email,))
        db.commit()
        session.clear()
        session['email'] = email
        return jsonify(ok=True)

    @app.get('/api/items')
    @login_required
    def list_items():
        rows = get_db().execute('SELECT * FROM items ORDER BY id DESC').fetchall()
        return jsonify([item_json(r) for r in rows])

    @app.get('/api/items/<int:item_id>')
    @login_required
    def get_item(item_id):
        row = get_db().execute('SELECT * FROM items WHERE id = ?', (item_id,)).fetchone()
        if row is None:
            abort(404, '옷을 찾을 수 없어요')
        return jsonify(item_json(row))

    @app.post('/api/items')
    @login_required
    def create_item():
        data = validate_item_data(request.form.get('data'))
        files = request.files.getlist('photos')
        exts = validate_photos(files)

        upload_dir = Path(app.config['UPLOAD_FOLDER'])
        names = []
        for f, ext in zip(files, exts):
            name = uuid.uuid4().hex + ext
            f.save(upload_dir / name)
            names.append(name)

        db = get_db()
        cur = db.execute(
            'INSERT INTO items (owner_email, name, category, size, price, photos) VALUES (?, ?, ?, ?, ?, ?)',
            (current_email(), data['name'], data['category'], data['size'], data['price'], json.dumps(names)),
        )
        db.commit()
        row = db.execute('SELECT * FROM items WHERE id = ?', (cur.lastrowid,)).fetchone()
        return jsonify(item_json(row)), 201

    @app.get('/api/uploads/<path:filename>')
    def photo(filename):
        resp = send_from_directory(app.config['UPLOAD_FOLDER'], filename)
        resp.headers['X-Content-Type-Options'] = 'nosniff'
        return resp

    @app.post('/api/rentals')
    @login_required
    def create_rental():
        body = json_body()
        item_id = body.get('itemId')
        if not isinstance(item_id, int) or isinstance(item_id, bool):
            abort(400, 'itemId는 정수여야 해요')
        start = parse_date(body.get('from'), 'from')
        end = parse_date(body.get('to'), 'to')
        if end < start:
            abort(400, '반납일은 받는 날 이후여야 해요')

        db = get_db()
        if db.execute('SELECT 1 FROM items WHERE id = ?', (item_id,)).fetchone() is None:
            abort(404, '옷을 찾을 수 없어요')
        cur = db.execute(
            'INSERT INTO rentals (item_id, renter_email, from_date, to_date, step) VALUES (?, ?, ?, ?, ?)',
            (item_id, current_email(), start.strftime(DATE_FORMAT), end.strftime(DATE_FORMAT), FIRST_STEP),
        )
        db.commit()
        row = db.execute('SELECT * FROM rentals WHERE id = ?', (cur.lastrowid,)).fetchone()
        return jsonify(rental_json(row)), 201

    @app.get('/api/rentals/current')
    @login_required
    def current_rental():
        me = current_email()
        row = get_db().execute(
            'SELECT r.* FROM rentals r JOIN items i ON i.id = r.item_id '
            'WHERE r.renter_email = ? OR i.owner_email = ? ORDER BY r.id DESC LIMIT 1',
            (me, me),
        ).fetchone()
        if row is None:
            abort(404, '진행 중인 대여가 없어요')
        return jsonify(rental_json(row))

    @app.patch('/api/rentals/<int:rental_id>/<kind>')
    @login_required
    def advance_rental(rental_id, kind):
        if kind not in REQUIRED_STEP:
            abort(404, f'kind는 {", ".join(REQUIRED_STEP)} 중 하나여야 해요')
        me = current_email()
        db = get_db()
        row = db.execute(
            'SELECT r.*, i.owner_email FROM rentals r JOIN items i ON i.id = r.item_id WHERE r.id = ?',
            (rental_id,),
        ).fetchone()
        if row is None or me not in (row['renter_email'], row['owner_email']):
            abort(404, '대여 기록을 찾을 수 없어요')
        cur = db.execute(
            'UPDATE rentals SET step = step + 1 WHERE id = ? AND step = ?',
            (rental_id, REQUIRED_STEP[kind]),
        )
        db.commit()
        if cur.rowcount == 0:
            abort(409, f'지금 단계({row["step"]})에서는 {kind}를 할 수 없어요')
        row = db.execute('SELECT * FROM rentals WHERE id = ?', (rental_id,)).fetchone()
        return jsonify(rental_json(row))

    return app
