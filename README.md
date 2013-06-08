# Bind.js

Simple data binding for callbacks & HTML (also node.js compatible).

## Requires

setters/gettings, bind, qSA, getOwnPropertyNames, forEach - basically evergreen browser

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

## Restrictions

The bound object can't bind a new property path (certainly change existing property values), but new properties, like `cats` (in the example above) wouldn't have the mapping to know what to trigger (I do want to explore whether I can add an update method to re-read the mapping).

Also arrays are currently not boundable - I'm hoping to fix that either by adding a watcher (yes, polling) or by hijacking the `push` method.