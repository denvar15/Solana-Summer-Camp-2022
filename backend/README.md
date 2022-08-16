# GtG backend

The main purpose of backend in this project is to maintain data about cross-chain swaps and to synchronize and sign them , because currently there is no on-chain tool for such comprehensive objectives.

# Table of contents:

-   [Pre-reqs](#pre-reqs)
-   [Building from source](#building-from-source)
-   [Builing with Docker](#builing-with-docker)
-   [Docs](#docs)

# Pre-reqs

To build and run this app locally you will need a few things:

-   Install [Node.js](https://nodejs.org/en/)
-   Install [Postgresql](https://www.postgresql.org/download/)
-   Install [VS Code](https://code.visualstudio.com/)
-   Install [Docker](https://www.docker.com/get-started/)

# Building from source

-   Clone the repository

```
git clone https://github.com/denvar15/Solana-Summer-Camp-2022.git
```

-   Install dependencies

```
cd Solana-Summer-Camp-2022/backend
npm install
```

-   Configure your postgres server

```bash
# connect as default user
sudo -u postgres psql
# create db
CREATE DATABASE solana_camp;
# connect to it
\c solana_camp
```

-   Build and run the project

```
npm run build
npm start
```

Or, if you're using VS Code, you can use `cmd + shift + b` to run the default build task (which is mapped to `npm run build`), and then you can use the command palette (`cmd + shift + p`) and select `Tasks: Run Task` > `npm: start` to run `npm start` for you.

Finally, navigate to `http://localhost::8080/collection/list` and you should see popular nfts being served and rendered locally!

# Builing with Docker

-   Clone the repository

```
git clone https://github.com/denvar15/Solana-Summer-Camp-2022.git
```

-   Build docker image

```bash
cd Solana-Summer-Camp-2022/backend
docker build -t solana_production .
```

-   Run docker container with compose

```bash
docker compose up -d
```

# Docs

See [Endpoint docs](src/README.md#endpoints-contracts) for api documentation
