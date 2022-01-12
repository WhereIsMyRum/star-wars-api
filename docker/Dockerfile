FROM node:12.22.0-buster-slim as base
USER node:node

RUN mkdir -p /home/node/star-wars-serverless-api
WORKDIR /home/node/star-wars-serverless-api


FROM base as base_dev
USER root:root
RUN apt-get update 

USER node:node

FROM base_dev as app_dev_node_modules

COPY --chown=node:node ./package.json ./yarn.lock ./
RUN yarn install --frozen-lockfile \
  && yarn cache clean

FROM app_dev_node_modules as app_dev_build

COPY --chown=node:node ./src ./src
COPY --chown=node:node ./tsconfig.json ./tsconfig.build.json ./

RUN yarn run build

FROM app_dev_build as dev

COPY --chown=node:node ./serverless.yml ./
CMD ["serveless", "offline"]



