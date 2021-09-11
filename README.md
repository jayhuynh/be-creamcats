# CreamCats - Backend App

- [CreamCats - Backend App](#creamcats---backend-app)
  - [Usage](#usage)
  - [API Doc](#api-doc)
    - [View the API doc](#view-the-api-doc)
  - [Documentation](#documentation)
  - [Workflow](#workflow)

## Usage

To start, run:

```sh
$ docker-compose up
```

This will start:

* the node backend app on port `6400`
* the postgreSQL database on port `6401`

To change any of these ports, edit the `.env` file.

**Please run these commands when 1) starting backend first time, or 2) have a new schema update**:

```sh
$ npm run db-reset
$ npm run db-generate
```

## API Doc

### View the API doc

```sh
$ npm run api-doc
```

This should open the doc at `http://localhost:6400/api-doc`.


## Documentation

See the [wiki](https://github.com/jayhuynh/be-creamcats/wiki).

## Workflow

* Please follow [Github flow](https://guides.github.com/introduction/flow/).
