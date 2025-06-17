import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // 파일 변경 확인을 위해 사용함 / 맥os 윈도우 에서는 어쩔 수 없이 이 방식을 사용할 수 밖에 없는 듯
  server: {
    host: true, // Docker 환경에서 컨테이너 외부 접근 허용
    port: 5173, // 기본 Vite 포트
    watch: {
      usePolling: true, // 파일 변경 감지 방식: 폴링 사용
      interval: 100, // (선택 사항) 폴링 간격 (밀리초), 기본값 100
    },
  },
});