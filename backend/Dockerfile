FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

COPY ../barrios_formosa_capital.json /app/barrios_formosa_capital.json

EXPOSE 3000

CMD ["npm", "run", "start:dev"]
