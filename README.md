# CreamCats - Backend App

## Usage

* To start both the node & and postgreSQL container, run:

```sh
$ docker-compose up
```

* Run the following command to clean out the current database, update the database schema, and re-seed the database:

```sh
$ npm run db-reset
```

## API Doc

* View the API doc

```sh
$ npm run api-doc
```

### Edit the API doc

To start the editor:

```sh
$ npm run swagger-edit
```

Note that you have to **manually import and export** the `swagger.yaml` file in `api-doc/swagger.yaml`.

## Documentation

See the [wiki](https://github.com/jayhuynh/be-creamcats/wiki).

## Workflow

* Please follow [Github flow](https://guides.github.com/introduction/flow/).
