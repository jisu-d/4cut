FROM node:22.16.0

# 컨테이너 내의 작업 디렉터리 설정
WORKDIR /app

# pnpm 전역 설치
RUN npm install -g pnpm@10.12.1

# package.json과 pnpm-lock.yaml을 복사하여 Docker 캐시 활용
COPY package.json pnpm-lock.yaml ./

# pnpm을 사용하여 의존성 설치
RUN pnpm install --frozen-lockfile

# 나머지 애플리케이션 코드 복사
COPY . .

# React 앱이 실행되는 포트 노출
EXPOSE 5173

# React 앱을 실행하는 명령어
CMD ["pnpm", "dev", '--host']