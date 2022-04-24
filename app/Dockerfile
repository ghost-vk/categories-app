FROM node:16.14.2-alpine3.14

WORKDIR /usr/src/app

COPY package*.json .
COPY ./dist ./dist

RUN npm install --production

EXPOSE 8080

CMD ["node", "dist/index.js"]
