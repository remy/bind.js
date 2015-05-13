# Bind.js

Two way data binding for HTML and JavaScript (also node.js compatible) with support for transforming data.

[![Test status](https://api.travis-ci.org/remy/bind.png?branch=master)](https://travis-ci.org/remy/bind) [![Coverage Status](https://coveralls.io/repos/remy/bind/badge.svg)](https://coveralls.io/r/remy/bind)

## Demos

- [Hangman game](http://jsbin.com/oZOvIJ/5/edit?js,output) - more involved example of data binding
- [Simple one to one binding](http://jsbin.com/xavej/1/edit?js,output) - time & modulus bound to simple elements

## Requires

setters/gettings, fn.bind, qSA (if using selectors), getOwnPropertyNames.

## Arguments

* obj: this is your data structure that is copied in to the Bind
* mapping: this is a key/value pair of object path to DOM selector or callback function

## Example

    var data = Bind({
      me: {
        name: "@rem",
        score: 11,
        location: {
          city: 'Brighton',
          country: 'England'
        }
      }
    }, {
      'me.score': '#score',
      'me.name': '#name',
      'me.location.city': function (city) {
        alert(data.me.name + "'s city is " + city);
      }
    });

    data.me.location = 'London';
    data.me = {
      name: 'Remy Sharp',
      score: 20
    };

## Arrays

I've added array support by creating an augmented array in place of your original array. It's pretty filthy, but works (TODO: only tested in Mocha, Node & Chrome - need to extend).

Simple example:

```
var data = Bind({
  cats: ['ninja', 'missy', 'dizzy']
}, {
  'cats': function (cats, old) {
    console.log('cats changed!', cats, old);
    document.querySelector('#cats').innerHTML = '<li>' + cats.join('<li>');
  },
  'cats.0': function (newCat, oldCat) {
    console.log('The newest cat at the start of our family is ' + newCat);
  }
});

data.cats.unshift('sam');
```

## Restrictions

### Deleted properties

There's no handling deleted properties. Once a property is deleted, if it's added back in again, it can't be tracked:

```
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

### New Properties

The bound object can't bind a new property path (certainly change existing property values), but new properties, like `cats` (in the example above) wouldn't have the mapping to know what to trigger (I do want to explore whether I can add an update method to re-read the mapping).
