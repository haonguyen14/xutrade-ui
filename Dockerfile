FROM node:7.10.0

RUN apt-get update -yq && apt-get upgrade -yq && \
    apt-get install -yq build-essential && \
    npm install -g node-gyp

ADD package.json /tmp/package.json
RUN cd /tmp && npm install
RUN mkdir -p /usr/src/app && cp -a /tmp/node_modules /usr/src/app

WORKDIR /usr/src/app
ADD . /usr/src/app

RUN npm run build

RUN rm -rf ./build
RUN rm -rf ./test
RUN rm -rf ./src

ENV PORT=80
EXPOSE 80
CMD [ "npm", "start" ]
