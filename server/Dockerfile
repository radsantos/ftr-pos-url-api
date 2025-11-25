FROM node:20-slim AS builder

WORKDIR /usr/src/app

RUN npm install -g pnpm

# Copia todos os arquivos necessários para o build
COPY package.json pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY server/package.json server/
COPY server/drizzle/migrations ./server/drizzle/migrations
COPY web/package.json web/
COPY tsconfig.json ./

RUN pnpm install --frozen-lockfile

COPY server/src server/src

WORKDIR /usr/src/app/server
RUN npx tsc


# --- Etapa final (runtime) ---
FROM node:20-slim

WORKDIR /usr/src/app

# Copia node_modules do builder
COPY --from=builder /usr/src/app/node_modules ./node_modules

# Copia código compilado e arquivos estáticos necessários
COPY --from=builder /usr/src/app/server/dist ./server/dist
COPY --from=builder /usr/src/app/server/drizzle/migrations ./server/drizzle/migrations
COPY --from=builder /usr/src/app/server/package.json ./server/package.json

WORKDIR /usr/src/app/server

EXPOSE 3000

CMD ["node", "dist/server.js"]