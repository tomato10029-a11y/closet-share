import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
// 개발 중에는 /api 요청을 Flask(5000번 포트)로 넘깁니다. (CORS 설정 없이도 동작)
export default defineConfig({plugins:[react()],server:{proxy:{'/api':'http://localhost:5000'}}});
