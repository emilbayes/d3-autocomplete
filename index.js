var d3 = require('d3')
var hook = require('d3-utils/lifecycle')
var ƒ = require('d3-utils/get')

var objectEqual = require('object-equal')
var origRaf = require('raf')
var raf = require('auto-abort')(origRaf, function (f) { return origRaf.cancel(f) })

var KEY_CODES = {
  UP: 38,
  DOWN: 40,
  ENTER: 13,
  ESC: 27
}

function indexOf (arr, obj) {
  for (var i = 0; i < arr.length; i++) {
    if (objectEqual(obj, arr[i])) return i
  }

  return -1
}

module.exports = function (attrs, queryCallback) {
  var emitter = d3.dispatch('change', 'error')

  var selectedIndex = 0
  var suggestionsData = []
  var hideSuggestionsTimer

  var element = document.createElement('section')
  var $elm = d3.select(element)
  var input = document.createElement('input')
  var $input = d3.select(input)
  var suggestions = document.createElement('ol')
  var $suggestions = d3.select(suggestions)

  element.appendChild(input)
  element.appendChild(suggestions)

  $elm.classed({
    'autocomplete': true,
    'control': true
  })

  $input
      .classed('input', true)
      .attr({
        type: 'search',
        name: 'autocomplete',
        placeholder: attrs.placeholder || 'Search...'
      })
      .on('focus', completeQuery)
      .on('blur', hideSuggestions)
      .on('input', completeQuery)
      .on('keydown', keyboardRouter)
      .on('keyup', function () { d3.event.stopPropagation() })
      .on('keypress', function () { d3.event.stopPropagation() })

  $suggestions
      .classed('suggestions', true)
      .style('display', 'none')

  return {
    element,
    on,

    add,
    delete: del,
    clear,

    value
  }

  function completeQuery () {
    if (hideSuggestionsTimer) clearTimeout(hideSuggestionsTimer)
    $elm.classed('is-loading', true)

    queryCallback($input.property('value'), function (err, results) {
      $elm.classed('is-loading', false)
      if (err) return emitter.error(err)

      $suggestions.style('display', null)
      selectedIndex = 0

      suggestionsData = results

      raf(render)
    })
  }

  function render () {
    $suggestions.selectAll('li')
      .data(suggestionsData, JSON.stringify)
    .call(hook(
      function (enter) {
        enter.append('li')
            .on('click', change)
            .on('mouseover', function (_, i) {
              selectedIndex = i
              raf(render)
            })
            .text(ƒ('label'))
      },
      function (update) {
        update
            .classed('search-highlight', function (d, i) {
              return i === selectedIndex
            })
      },
      function (exit) {
        exit.remove()
      }
    ))
  }

  function hideSuggestions (delta) {
    if (hideSuggestionsTimer) return

    hideSuggestionsTimer = setTimeout(function () {
      $suggestions.style('display', 'none')
      hideSuggestionsTimer = null
    }, 100)
  }

  function keyboardRouter () {
    d3.event.stopPropagation()
    var keyCode = d3.event.keyCode
    if (keyCode === KEY_CODES.ENTER) {
      change(suggestionsData[selectedIndex])
      hideSuggestions()
      return
    }

    if (keyCode === KEY_CODES.ESC) {
      selectedIndex = 0
      hideSuggestions()
      return
    }

    if (keyCode === KEY_CODES.UP) {
      d3.event.preventDefault()
      selectedIndex = mod(selectedIndex - 1, suggestionsData.length)
      raf(render)
      return
    }

    if (keyCode === KEY_CODES.DOWN) {
      d3.event.preventDefault()
      selectedIndex = mod(selectedIndex + 1, suggestionsData.length)
      raf(render)
      return
    }
  }

  function on () {
    return emitter.on.apply(emitter, arguments)
  }

  function add (obj, before) {
    if (Array.isArray(obj)) suggestionsData.splice.apply(suggestionsData, [indexOf(suggestionsData, before), 0].concat(obj))
    else suggestionsData.splice(indexOf(suggestionsData, before), 0, obj)
    raf(render)
  }

  function del (obj) {
    var idx = indexOf(suggestionsData, obj)

    if (idx > -1) {
      suggestionsData.splice(idx, 1)
      raf(render)
    }
  }

  function clear () {
    suggestionsData = []
    raf(render)
  }

  function change (d) {
    $input.property('value', d.label)
    emitter.change(d)
  }

  function value (val) {
    $input.property('value', val)
  }
}

function mod (n, p) {
  return ((n % p) + p) % p
}
