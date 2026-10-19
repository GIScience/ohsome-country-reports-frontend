FROM node:24 AS build-step

RUN mkdir /app
WORKDIR /app

# install dependencies
COPY package.json package-lock.json /app/
RUN --mount=type=cache,target=/root/.npm npm install

# copy relevant files
COPY index.html postcss.config.js tailwind.config.js test-iframe.html tsconfig.json tsconfig.node.json vite.config.ts /app/

# copy relevant folders
COPY src /app/src

# build
RUN --mount=type=cache,target=/root/.npm npm run build:prod

FROM nginx:alpine-slim
RUN echo 'absolute_redirect off;' > /etc/nginx/conf.d/redirect.conf
COPY --from=build-step /app/dist /usr/share/nginx/html

EXPOSE 80
