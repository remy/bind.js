# Bind.js

Two way data binding for HTML and JavaScript (with node.js compatibility) with additional support for transforming data before it arrives in the DOM.

[![Test status](https://api.travis-ci.org/remy/bind.js.svg?branch=master)](https://travis-ci.org/remy/bind.js) [![Coverage Status](https://coveralls.io/repos/remy/bind.js/badge.svg)](https://coveralls.io/r/remy/bind.js)

## Demos

- [Form elements](https://jsbin.com/yoqaku/1/edit?console,output) - comprehensive demo of two-way binding with different form elements
- [Hangman game](http://rem.jsbin.com/oZOvIJ/9/edit?js,output) - more involved example of data binding
- [Simple one to one binding](http://rem.jsbin.com/xavej/2/edit?js,output) - time & modulus bound to simple elements
- [Two way binding](http://rem.jsbin.com/vezeja/5/edit?js,output) - value updates on interval, and DOM updates with it

## Prerequisites

setters/gettings, fn.bind, qSA (if using selectors), getOwnPropertyNames.

## Usage

Create a `new Bind` based on an object and a mapping. The mapping uses a key/value pair of property path to handler. The handler can be a CSS selector (and thus updates the DOM) or a callback.

There is also an *advanced* value that allows finer grain control over the binding (seen in the `skills` value in the example below).

The node version can be installed using `npm install -S bind.js`.

## Example [(JS Bin)](http://jsbin.com/fupipe/edit?html,js,output)

```js
var player = Bind({
  name: '@rem',
  score: 11,
  location: {
    city: 'Brighton',
    country: 'England'
  },
  skills: [
    'code',
    'chicken',
    'shortness'
  ]
}, {
  score: '#score',
  name: '#name',
  'location.city': function (city) {
    alert(this.name + "'s city is " + city);
  },
  skills: {
    dom: '#skills',
    transform: function (value) {
      return '<li>' + this.safe(value) + '</li>';
    },
  }
});

document.querySelector('form').onsubmit = function (event) {
  event.preventDefault();
  player.skills.push(document.querySelector('#newSkill').value);
  this.reset();
};
```

Notice that in the second argument to `Bind` the mapping key is a *path* to the object property separated by a `.` period: `'location.city': function`.

## Mapping values

Mapping values can be:

* String: a CSS expression
* Function: a callback that receives the new value
* Object: see below

If the mapping value is an object, all the following properties are supported:

* `dom`: a string CSS expression
* `callback`: a function
* `transform`: a function that receives the new value, and returns the HTML that will be set to the DOM.
* `parse`: a function that receives the changed value from the DOM and returns the value that will be set in the JavaScript object

Note that the `transform` function is applied to array elements when mapped to an array, and so does not receive the entire array. This is to allow control over updating lists in the DOM (see the [example](#example) above).

## Arrays

Individual array elements cab be also mapped using the dot notation and the index in the array.

In the example below, when the first cat name in the array changes, it will update the DOM.

```js
var data = Bind({
  cats: ['ninja', 'missy', 'dizzy']
}, {
  cats: {
    dom: 'ul',
    transform: function (name) {
      return '<li>' + name + '</li>';
    }
  },
  'cats.0': '#first-cat'
});

// later let's add Sam to the cats
data.cats.unshift('sam');
```

## Using the DOM to inform values

If you want the DOM to drive the initial values of the bind object, then you'll need to set the JavaScript property value to `null` and it will read the value from the DOM at startup:

```js
var data = Bind({
  price: null
}, {
  price: '.price',
});
```

Now in the HTML:

```html
<p class="price">£10.50</p>
```

Now `data.price` has the value of `£10.50`. If you wanted this to be a float instead, you would use the `parse` and `transform` methods:

```js
var data = Bind({
  price: null
}, {
  price: {
    dom: '.price',
    parse: function (v) {
      return parseFloat(v.replace(/^£/, ''), 10);
    },
    transform: function (v) {
      return '£' + v.toFixed(2);
    }
});
```

Now `data.price` is `10.5`, and when the value is changed to `data.price = 11.5`, the DOM is updated to `£11.50`.

## Restrictions

### Deleting primitive property

There's no handling deleted primitive properties. Once it is deleted, if it's added back in again, it can't be tracked:

```js
data.me.score++; // updates element#score
delete data.me.score;
data.me.score = 1; // does nothing

// A work around is to restore the property object, the following
// re-uses the bind map, and updates element#score again
data.me = {
  score: 1,
  // ... etc
};
```

### Events at the root object

This isn't currently supported, but could be implemented with a [special mapping](https://github.com/remy/bind.js/issues/7) - I'm open to suggestions here.

Otherwise, the object can be nested and callbacks be bound to the first depth property (as seen in the [forms example](http://jsbin.com/yoqaku/1/edit?js,output))

## Exporting

If the original, unbound object is needed, a utility function is available on the root object:

```js
var copy = data.__export();
```

## License

MIT / http://rem.mit-license.org
