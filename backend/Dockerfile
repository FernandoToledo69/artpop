FROM node:24-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run prisma:generate
RUN npm run build

EXPOSE 3333 3334

CMD ["npm", "run", "start"]
