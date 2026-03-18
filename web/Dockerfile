FROM node:20-slim

WORKDIR /app

COPY web/package.json ./

RUN npm install

RUN rm -rf node_modules

COPY web/ .

RUN npm install

RUN echo "VITE_BACKEND_URL=http://api:3000" > .env

RUN ls -la node_modules/.bin/

EXPOSE 5173

CMD ["npx", "vite", "--port", "5173", "--host", "0.0.0.0"]