# 동네옷장 백엔드 (Flask)
```
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env     # SECRET_KEY, SMTP_USER, SMTP_PASSWORD 채우기
flask --app app run
```
- 포트는 `.env`의 `FLASK_RUN_PORT` (프론트 `.env`의 `API_PROXY_TARGET`과 맞추기)
- `.env` 값이 비어 있으면 서버가 뜨지 않음. 발송용 Gmail은 2단계 인증 후 앱 비밀번호를 발급받아 `SMTP_PASSWORD`에 넣음
- 프론트 `.env` 에서 `VITE_USE_MOCK=false` 여야 이 서버를 호출함
- SQLite DB와 업로드 사진은 `instance/` 아래에 생김 (git 제외)
- 목업 옷 6벌로 시작하려면 처음 실행 전에 `cp -R seed instance` (`seed/`는 목업 데이터만 담은 DB와 사진)
- 로그인: @knu.ac.kr 주소로 4자리 코드를 메일 발송, 확인되면 세션 쿠키로 로그인
  - 코드는 10분 유효, 5번 틀리면 다시 받아야 함, 같은 주소로는 60초에 한 번만 발송
- 엔드포인트 (auth와 사진 외에는 로그인 필요)
  - POST /api/auth/send-code, /api/auth/verify
  - GET /api/items, GET /api/items/<id>, POST /api/items (multipart: data(JSON), photos 1~3장)
  - GET /api/uploads/<파일명> (등록된 사진)
  - POST /api/rentals, GET /api/rentals/current, PATCH /api/rentals/<id>/handover|return|refund
  - 현재 대여 조회와 인수·반납 처리는 빌린 사람과 옷 주인만 가능
