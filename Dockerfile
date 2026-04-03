FROM node:20-alpine

ARG APP_PORT=3001

ENV PORT=$APP_PORT

WORKDIR /app

COPY package*.json ./
RUN npm ci --only-production

COPY . .

EXPOSE $PORT

CMD ["npm", "start"]
