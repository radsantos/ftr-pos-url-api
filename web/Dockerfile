FROM node:20-alpine

WORKDIR /usr/src/app

RUN npm install -g pnpm

COPY . .

RUN pnpm install

WORKDIR /usr/src/app/web

EXPOSE 5173 

CMD ["pnpm", "run", "dev", "--host", "0.0.0.0"]