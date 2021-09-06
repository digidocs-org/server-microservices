FROM node:14-alpine As base

WORKDIR /app

FROM base AS dependencies

COPY recipient recipient
COPY guardian guardian
COPY package.json .
COPY yarn.lock .
COPY .npmrc .npmrc

RUN yarn install --pure-lockfile --non-interactive --cache-folder ./ycache; rm -rf ./ycache

CMD ["yarn", "start-recipient"]