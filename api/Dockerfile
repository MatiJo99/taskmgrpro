FROM node:20-alpine
WORKDIR /usr/src/app
RUN apk add --no-cache curl openssl
COPY package*.json ./ 
RUN npm install
COPY . .
RUN npm run prisma:generate
EXPOSE 5000
CMD ["npm", "start"]