FROM node:14-alpine As base

WORKDIR /app

FROM base AS dependencies

COPY guardian guardian
COPY internal-gateway internal-gateway
COPY package.json .
COPY .npmrc .npmrc

RUN yarn install --pure-lockfile --non-interactive --cache-folder ./ycache; rm -rf ./ycache

CMD ["yarn", "start-internal-gateway"]