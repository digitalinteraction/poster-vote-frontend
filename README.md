# PosterVote frontend

This is the repo for the PosterVote front end source code.
It is a [VueJs](https://vuejs.org/) app written in JavaScript and deployed through [Docker](https://www.docker.com/).
It is a [PWA](https://developers.google.com/web/progressive-web-apps/)
served inside a single `index.html` file which is compiled through the
[vue cli](https://cli.vuejs.org/) using [Webpack](https://webpack.js.org/).

[What is PosterVote?](https://github.com/digitalinteraction/poster-vote)

<!-- toc-head -->

## Table of Contents

- [Development](#development)
  - [Setup](#setup)
  - [Regular use](#regular-use)
  - [Irregular use](#irregular-use)
  - [Structure](#structure)
  - [Code formatting](#code-formatting)
- [Deployment](#deployment)
  - [Building the image](#building-the-image)
  - [Using the image](#using-the-image)
- [Future Work](#future-work)

<!-- toc-tail -->

## Development

### Setup

To develop on this repo you will need to have [Docker](https://www.docker.com/) and
[node.js](https://nodejs.org) installed on your dev machine and have an understanding of them.
This guide assumes you have the repo checked out and are on macOS, but equivalent commands are available.

You'll only need to follow this setup once for your dev machine.

```bash
# Install dependencies
npm install

# Setup the development api server
# -> Fill in your SENDGRID_TOKEN, see https://app.sendgrid.com/settings/api_keys
cp .env.api.example .env.api.local
nano .env.api.local

# Start up a mysql and api instance using docker
# -> See `docker-compose.yml` for how it works
# -> Remember to stop these containers when you've finished with 'docker-compose stop'
docker-compuse up -d

# Run the database migrations
docker-compose exec api cli
```

### Regular use

These are the commands you'll regularly run to develop the API, in no particular order.

```bash
# Run the webpack server
# -> Runs on http://localhost:8080
# -> Stop with Ctrl+C
# -> Watches for changes and hot reloads in the browse
npm run serve

# Stop development containers when you've finished developing
docker-compose stop
```

### Irregular use

These are commands you might need to run but probably won't, also in no particular order.

```bash
# Generate the table of contents for this readme
# -> It'll replace content between the toc-head and toc-tail HTML comments
npm run gen-readme-toc

# Manually lint code with vue-cli-service
npm run lint

# Manually format code
# -> This repo is setup to automatically format code on git-push
npm run prettier

# Manually build all assets (html, css, js & images)
# -> Runs both the other build commands together
# -> Writes to dist/
npm run build

# Generates sized favicons based on `public/large-icon.png`
node tools/genFavicon.js
```

### Structure

| Folder         | Use                                                          |
| -------------- | ------------------------------------------------------------ |
| public         | Static assets to be served by nginx                          |
| src            | The location of the source code                              |
| src/assets     | Assets to be compiled in with webpack                        |
| src/components | Custom Vue components                                        |
| src/services   | Custom js services to access things, i.e. the postervote api |
| src/views      | Custom Vue components to be routed to                        |
| tools          | Scripts to ease development                                  |

### Code formatting

This repo uses [Prettier](https://prettier.io/) to automatically format code to a consistent standard.
It works using the [husky](https://www.npmjs.com/package/husky)
and [lint-staged](https://www.npmjs.com/package/lint-staged) npm packages to
automatically format code whenever code is commited.
This means that code that is pushed to the repo is always formatted to a consistent standard.

You can manually run the formatter with `npm run prettier` if you want.

Prettier is slightly configured in [.prettierrc.yml](/.prettierrc.yml)
and also ignores files using [.prettierignore](/.prettierignore).

## Deployment

### Building the image

This repo uses a [GitLab CI](https://about.gitlab.com/product/continuous-integration/)
to build a Docker image when you push a git tag.
This is designed to be used with the `npm version` command so all docker images are [semantically versioned](https://semver.org/).
The `:latest` docker tag is not used.

This job runs using the [.gitlab-ci.yml](/.gitlab-ci.yml) file which
runs a docker build using the [Dockerfile](/Dockerfile)
and **only** runs when you push a [tag](https://git-scm.com/book/en/v2/Git-Basics-Tagging).

It pushes these docker images to the GitLab registry of the repo.
A slight nuance is that it will replace a preceding `v` in tag names, formatting `v1.0.0` to `1.0.0`.

```bash
# Deploy a new version of the CLI
npm version # major | minor | patch | --help
git push --tags
```

### Using the image

With this docker image you can easily deploy it to your server using docker-compose.
This repo uses [configurable nginx](https://github.com/robb-j/configurable-nginx/)
to allow docker environment variables be set inside the JavaScript PWA.
You can set where the api is as seen below.

```yml
version: '3'

services:
  web:
    image: openlab.ncl.ac.uk:4567/poster-vote/vue-frontend:1.0.0
    restart: unless-stopped
    ports:
      - 80:80
    environment:
      - CONFIG_KEYS=API_URL
      - API_URL=https://api.postervote.example.io
```

## Future Work

- Only show your posters on `/posters` (if you visted another and its cached)

---

> The code on https://github.com/digitalinteraction/poster-vote-frontend is a mirror of https://openlab.ncl.ac.uk/gitlab/poster-vote/vue-frontend
