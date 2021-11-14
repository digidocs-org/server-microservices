FROM node:14-alpine As base

WORKDIR /app

FROM base AS dependencies

COPY authorization authorization
COPY guardian guardian
COPY package.json .
COPY .npmrc .npmrc

RUN yarn install --pure-lockfile --non-interactive --cache-folder ./ycache; rm -rf ./ycache

CMD ["yarn", "start-authorization"]