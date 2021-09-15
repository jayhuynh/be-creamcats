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

To view the database, run:

```sh
$ npm run db-view
```

This will run the prisma stdio (database viewer) in your browser on port `5555`.

## API Doc

### View the API doc

```sh
$ npm run api-doc
```

This should open the doc at `http://localhost:6400/api-doc`.

## Known issues

You may encounter `Permission denied` for directories in `prisma/migrations`, especially when creating new migrations yourself. My theory is that these directories are created inside of the container, and a user on the host container do not have write permission to them by default. To fix this, simply run:

```
$ chmod +rw prisma/migrations
```


## Documentation

See the [wiki](https://github.com/jayhuynh/be-creamcats/wiki).

## Workflow

* Please follow [Github flow](https://guides.github.com/introduction/flow/).
