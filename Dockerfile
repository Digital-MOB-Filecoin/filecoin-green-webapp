FROM node:lts-alpine AS build

ARG REACT_APP_API_BASE_URL

WORKDIR /usr/src/app

COPY package.json yarn.lock ./
RUN yarn install --pure-lockfile \
  && yarn cache clean
COPY . ./
RUN yarn build

FROM nginx:stable-alpine AS release

COPY --from=build /usr/src/app/build /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]
