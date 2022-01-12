## Description

[Star Wars Serverless Api]

This app uses a dockerized version of `serverless-offline`.
The dockerized serverless app runs on port `3002`. To access the API documentation go to `localhost:3002/dev/api/swagger`.

A most notable shortcut that was made in order to speed up the app development was to not use environmental variables in a few obvious places, such as the database connection string or the database credentials.
Also, the database connection is not password protected for the same reasons.

## Prerequisites

Docker installed

## Installation

```bash
# install packages
$ yarn install

# build project
$ yarn run build

```

## Running the app

The app for the development should be run in docker, since it depends on a mongo database container. To speed up the development, live reloading is achieved by running both the docker containers and the regular nest.js development mode that compiles files on the go.
So in order to achieve a dev environment with live reloading, in two separate console instances we must run:

```bash
# development
$ yarn run start:dev

# watch mode
$ docker-compose up
```

This should build the docker image as well as start the hot reloading process.
Note: the `dist` folder is a mounted volume by default (`docker-compose.yaml`). If you do not build the project and do not remove the mount from the `docker-compose.yaml` the API will not work (since the `dist` folder will be overridden by an empty local `dist`).
So if you wish to run the API not in a hot-reload dev mode, the `dist` mount needs to be removed.

## Test

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```
