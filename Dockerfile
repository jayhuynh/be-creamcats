FROM node:14-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
EXPOSE ${APP_CONT_PORT}

CMD ["npm", "run", "dev"]
