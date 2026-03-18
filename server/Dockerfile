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
COPY server/drizzle server/drizzle

WORKDIR /usr/src/app/server
RUN npx tsc


RUN ls -la /usr/src/app/server/drizzle/migrations/


FROM node:20-slim

WORKDIR /usr/src/app


COPY --from=builder /usr/src/app/node_modules ./node_modules


COPY --from=builder /usr/src/app/server/dist ./server/dist


COPY --from=builder /usr/src/app/server/drizzle ./drizzle


COPY --from=builder /usr/src/app/server/drizzle ./server/drizzle

COPY --from=builder /usr/src/app/server/package.json ./server/package.json


RUN ls -la /usr/src/app/ && ls -la /usr/src/app/drizzle/ && ls -la /usr/src/app/drizzle/migrations/

WORKDIR /usr/src/app/server

EXPOSE 3000

CMD ["node", "dist/server.js"]