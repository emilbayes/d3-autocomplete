var createAutocomplete = require('./index2.js')

var autocomplete = createAutocomplete({}, function (query, cb) {
  setTimeout(function () {
    cb(null, [
      {label: 'Foo', gender: 'M'},
      {label: 'Bar', gender: 'F'}
    ])
  }, 500)
})

autocomplete.on('change', d => console.log(d))
autocomplete.on('error', err => console.error(err))

document.body.appendChild(autocomplete.element)
