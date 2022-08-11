FROM node:18

WORKDIR /app

COPY package.json ./

RUN npm install --only=production

COPY . .

RUN npm run build; exit 0

CMD [ "npm", "start" ]