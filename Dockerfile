FROM node:14-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npx prisma generate
RUN npx tsc

EXPOSE ${APP_CONT_PORT}

CMD ["npm", "run", "dev"]
