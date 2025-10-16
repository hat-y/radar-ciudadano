FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Expose port
EXPOSE 3000

# Use dev mode with hot reload
CMD ["npm", "run", "start:dev"]