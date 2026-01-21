FROM node:lts-alpine as build-stage

WORKDIR /var/www/html
COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build-only

FROM nginx:stable-alpine as production-stage
COPY --from=build-stage /var/www/html/dist /usr/share/nginx/html
EXPOSE 5173

CMD ["nginx", "-g", "daemon off;"]