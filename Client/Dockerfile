FROM node:lts-alpine AS build-stage

WORKDIR /app
COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build-only


# FROM nginx:stable-alpine AS production-stage
# COPY --from=build-stage /app/dist /usr/share/nginx/html
# EXPOSE 5173

# CMD ["nginx", "-g", "daemon off;"]