FROM node:16-buster

WORKDIR /app

ENV NODE_ENV=development

COPY package.json yarn.lock ./

COPY . .

EXPOSE 6000