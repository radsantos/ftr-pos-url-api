FROM node:20-slim AS builder

WORKDIR /usr/src/app


RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY server/package.json server/
COPY web/package.json web/
COPY tsconfig.json ./

RUN pnpm install --frozen-lockfile

COPY server/src server/src

WORKDIR /usr/src/app/server

RUN npx tsc

FROM node:20-slim

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/node_modules ./node_modules

COPY --from=builder /usr/src/app/server/dist server/dist
COPY server/package.json server/

WORKDIR /usr/src/app/server

EXPOSE 3000

CMD ["node", "dist/server.js"]