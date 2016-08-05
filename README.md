# `d3-autocomplete`

> Small autocomplete written using D3

## Install

```sh
npm install ...
```

## Usage

```js
var createAutocomplete = require('d3-autocomplete')

var autocomplete = createAutocomplete({placeholder: 'Søg'}, function (query, cb) {
  cb(null, [
    {label: 'Foo', some: 'key'},
    {label: 'Bar', some: 'key'}
  ])
})

autocomplete.on('change', function (data) {
  console.log(data)
})

autocomplete.on('error', function (err) {
  console.error(err)
})

document.body.appendChild(autocomplete.element)

```

## API

### `createAutocomplete(attrs, queryCallback)`

#### `attrs`

#### `queryCallback`

## License

[ISC](LICENSE.md)
