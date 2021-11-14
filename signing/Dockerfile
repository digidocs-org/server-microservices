FROM openjdk:8


WORKDIR /usr/src/app

RUN apt-get install -y curl \
    && curl -sL https://deb.nodesource.com/setup_14.x | bash - \
    && apt-get install -y nodejs \
    && curl -L https://www.npmjs.com/install.sh | sh

COPY signing signing
COPY guardian guardian
COPY package.json .
COPY .npmrc .npmrc

RUN npm install -g yarn
RUN yarn install --pure-lockfile --non-interactive --cache-folder ./ycache; rm -rf ./ycache

CMD ["yarn", "start-signing"]