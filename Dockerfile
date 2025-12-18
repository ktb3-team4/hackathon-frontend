FROM --platform=linux/amd64 node:20-alpine

WORKDIR /app

# 의존성 설치
COPY package.json package-lock.json ./
RUN npm install

# 소스 복사
COPY . .

# Next.js 빌드
RUN npm run build

EXPOSE 3000

# Next.js 실행
CMD ["npm", "start"]
