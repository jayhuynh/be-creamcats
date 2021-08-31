# CreamCats - Backend App

## Usage

To start, run:

```sh
$ docker-compose up
```

This will start:

* the node backend app on port `6400`
* the postgreSQL database on port `6401`
* the swagger editor on port `6402`

To change any of these ports, edit the `.env` file.

Run the following command to clean out the current database, update the database schema, and re-seed the database:

```sh
$ npm run db-reset
```

## API Doc

### View the API doc

```sh
$ npm run api-doc
```

This should open the doc at `http://localhost:6400/api-doc`.


### Edit the API doc

To start the editor:

```sh
$ npm run swagger-edit
```

This should open the Swagger editor at `http://localhost:6402`. If you want to change the port, do so by changing `SWAGGER_EDITOR_HOST_PORT` in `.env`.

Note that you have to **manually import and export** the `swagger.yaml` file in `api-doc/swagger.yaml`.

## Documentation

See the [wiki](https://github.com/jayhuynh/be-creamcats/wiki).

## Workflow

* Please follow [Github flow](https://guides.github.com/introduction/flow/).
