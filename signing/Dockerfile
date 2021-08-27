FROM node:14-alpine As base

WORKDIR /app

FROM base AS dependencies

COPY signing signing
COPY guardian guardian
COPY package.json .
COPY yarn.lock .
COPY .npmrc .npmrc

# Install OpenJDK-8
RUN apt-get update && \
    apt-get install -y openjdk-8-jdk && \
    apt-get install -y ant && \
    apt-get clean;
    
# Fix certificate issues
RUN apt-get update && \
    apt-get install ca-certificates-java && \
    apt-get clean && \
    update-ca-certificates -f;

# Setup JAVA_HOME -- useful for docker commandline
ENV JAVA_HOME /usr/lib/jvm/java-8-openjdk-amd64/
RUN export JAVA_HOME

RUN yarn install --pure-lockfile --non-interactive --cache-folder ./ycache; rm -rf ./ycache

CMD ["yarn", "start-signing"]