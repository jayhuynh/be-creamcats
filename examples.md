# Examples

## `GET /positions`

```
curl "http://localhost:6400/positions?address=77%20Sir%20Fred%20Schonell%20Dr%20ST%20LUCIA%20QLD%204067&within=50000&gender=female&dayfrom=2020-01-01T14%3A48%3A00.000Z&dayto=2023-01-01T14%3A48%3A00.000Z&tags=Disability%20Services&tags=Community%20Services&tags=Young%20People&sort=distance&order=desc&limit=4" | python3 -m json.tool
```