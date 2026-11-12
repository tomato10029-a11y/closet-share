# 동네옷장 프론트엔드 (React + Vite)
```
npm install
cp .env.example .env     # VITE_USE_MOCK=true 면 샘플 데이터로 동작
npm run dev              # http://localhost:5173
```
- 데모 인증코드: `1234`, 이메일은 `@knu.ac.kr` 형식만 허용
- Flask 연동: `.env`에서 `VITE_USE_MOCK=false`. 개발 중 `/api`는 vite proxy가 `.env`의 `API_PROXY_TARGET`으로 전달
- API 호출은 모두 `src/api/client.js` 한 곳. 엔드포인트
  - POST /api/auth/send-code, /api/auth/verify
  - GET /api/items, GET /api/items/<id>, POST /api/items (multipart: data(JSON), photos)
  - POST /api/rentals, GET /api/rentals/current, PATCH /api/rentals/<id>/handover|return|refund
