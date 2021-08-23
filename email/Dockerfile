FROM node:14-alpine As base

WORKDIR /app

FROM base AS dependencies

COPY guardian guardian
COPY email email
COPY package.json .
COPY yarn.lock .
COPY .npmrc .npmrc

RUN yarn install --pure-lockfile --non-interactive --cache-folder ./ycache; rm -rf ./ycache

CMD ["yarn", "start-email"]