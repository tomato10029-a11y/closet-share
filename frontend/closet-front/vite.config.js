import {defineConfig,loadEnv} from 'vite';
import react from '@vitejs/plugin-react';
// 개발 중에는 /api 요청을 .env의 API_PROXY_TARGET(Flask 주소)으로 넘깁니다. (CORS 설정 없이도 동작)
export default defineConfig(({mode})=>({plugins:[react()],server:{proxy:{'/api':loadEnv(mode,process.cwd(),'').API_PROXY_TARGET||'http://localhost:5000'}}}));
