FROM openjdk:8


WORKDIR /usr/src/app

RUN apt-get install -y curl \
    && curl -sL https://deb.nodesource.com/setup_14.x | bash - \
    && apt-get install -y nodejs \
    && curl -L https://www.npmjs.com/install.sh | sh

RUN ln -sf /usr/share/zoneinfo/Asia/Kolkata /etc/localtime
RUN echo "Asia/Kolkata" | tee /etc/timezone
RUN dpkg-reconfigure --frontend noninteractive tzdata

RUN wget https://digidocs-prod-bucket.s3.ap-south-1.amazonaws.com/digital-sign.jar -P /usr/src/app/signing/src/signing/java-esign-utility
RUN wget https://digidocs-prod-bucket.s3.ap-south-1.amazonaws.com/aadhaar-sign.jar -P /usr/src/app/signing/src/signing/java-esign-utility
RUN wget https://digidocs-prod-bucket.s3.ap-south-1.amazonaws.com/sign.png -P /usr/src/app/signing/src/signing/sign-dir

COPY signing signing
COPY guardian guardian
COPY package.json .
COPY .npmrc .npmrc

RUN npm install -g yarn
RUN yarn install --pure-lockfile --non-interactive --cache-folder ./ycache; rm -rf ./ycache

CMD ["yarn", "start-signing"]