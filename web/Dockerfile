FROM node:20-slim

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./

RUN pnpm install

COPY . .

RUN echo "VITE_APP_API_URL=http://api:3000" > .env

EXPOSE 5173

CMD ["pnpm", "run", "dev", "--host", "0.0.0.0"]