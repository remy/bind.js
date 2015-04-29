/*

Simple data to HTML binding.

Requires:

setters/gettings, bind, qSA, getOwnPropertyNames, forEach. Basically: a decent
browser

Arguments:

- obj: this is your data structure that is copied in to the Bind
- mapping: this is a key/value pair of object path to DOM selector or callback

Example:

```
var data = Bind({
  me: {
    name: "@rem",
    score: 11
  },
  them: {
    score: 0
  }
}, {
  "me.score": "#score",
  "me.name": "#name",
  "them.score": function (newScore, oldScore) {
    // do something with scores
  }
});
```

Restrictions:

Only supports simple changes to the object - if you change the structure, then
the bindings are lost.

i.e. this won't work:

```
var data = Bind({...}, {...});

data.me.name = '@leftlogic'; //works
data.me = { // fails
  name: '@rem'
}
```

*/
var Bind = (function Bind(global) {
  'use strict';
  // support check
  if (!Function.bind) {
    throw new Error('Prerequisite APIs not available: Function.bind');
  }

  // this is a conditional because we're also supporting node environment
  var noop = function () {};
  var $ = global.document ? document.querySelectorAll.bind(document) : noop;
  var array = [];
  var o = 'object';

  // via https://github.com/codemix/fast.js/blob/master/array/forEach.js
  function forEach(subject, fn) {
    var length = subject.length;
    for (var i = 0; i < length; i++) {
      fn(subject[i], i, subject);
    }
  };

  function AugmentedArray(callback) {
    var methods = 'pop push reverse shift sort splice unshift'.split(' ');
    this.__callback = callback;
    forEach(methods, function eachArrayMethod(method) {
      this[method] = function augmentedMethod() {
        var before = this.slice(0);
        this.__dirty = true;
        var ret = array[method].apply(this, arguments);
        if (callback) {
          callback.call(this, this.slice(0), before);
        }
        delete this.__dirty;
        return ret;
      };
    }.bind(this));

    return this;
  }

  AugmentedArray.prototype = [];

  function extend(target, object, settings, _path) {
    if (!_path) { _path = []; }
    // loop through each property, and make getters & setters for
    // each type of "regular" value. If the key/value pair is an
    // object, then recursively call extend with the target and
    // object as the next level down.
    forEach(Object.getOwnPropertyNames(object), function eachProp(key) {
      var value = object[key];
      // create a new copy of the mapping path
      var path = [].slice.call(_path);
      var callback;

      // now create a path, so that obj { user: { name: xxx }} is
      // user.name when joined later.
      path.push(key);

      var selector = settings.mapping[path.join('.')];

      // look for the path in the mapping arg, and if the gave
      // us a callback, use that, otherwise...
      if (typeof selector === 'function') {
        callback = selector;
      } else if (selector) {
        // cache the matched elements. Note the :) is because qSA won't allow an
        // empty (or undefined) string so I like the smilie.
        var elements = $(selector || '☺');

        if (elements.length === 0) {
          console.warn('No elements found against "' + selector + '" selector');
        }

        // create a callback that loops over *all* the elements
        // matched from the selector (set up below), that checks
        // the node type, and either sets the input.value or
        // element.innerHTML to the value
        var valueSetters = ['SELECT', 'INPUT', 'PROGRESS'];
        callback = function (value) {
          if (elements) {
            forEach(elements, function (element) {
              if (valueSetters.indexOf(element.nodeName) !== -1) {
                element.value = value;
              } else {
                element.innerHTML = value;
              }
            });
          }
        };

        // let's make the binding two way...
        forEach(elements, function (element) {
          if (element.nodeName === 'INPUT' || element.nodeName === 'SELECT') {
            element.addEventListener('input', function () {
              // if (this.type === 'checkbox') {
              // FIXME can't handle multiple checkbox values
              // } else {
              target[key] = this.value;
              // }
            });
          }
        });

      }

      // set up a setter and getter for this property.
      // if the set value is another object, iterate over it, re-extending
      // so it gets these setters and getters on the set object properties.
      // when the setter is called, check if there's a callback, if so: fire.
      var definition = {
        // configurable to allow object properties to be later deleted
        configurable: true,
        enumerable: true,
        set: function (v) {
          var old = value !== v ? value : undefined;
          var oldparent;
          var parentIsArray = target instanceof AugmentedArray || Array.isArray(target);

          // if the parent object is an array - then capture the old state too
          // (later in dev) ...because?
          if (parentIsArray) {
            oldparent = target.slice(0);
          }

          // if the value we're setting is an object, enumerate the properties
          // and apply new setter & getters, returning our bound object
          if (settings.ready && typeof v === o && v !== null && !Array.isArray(v)) {
            value = extend(target[key] || {}, v, settings, path);
          } else {
            value = v;
          }

          // only fire the callback immediately when the initial data binding
          // is set up. If it's not, then defer until complete
          var cbwrapper = function initValue(callback, value, old, target, parentIsArray) {
            callback(value, old);
            // debugger;
            if (parentIsArray && !target.__dirty && target.__callback) {
              target.__callback(target.slice(0), oldparent);
            }
          }.bind(null, callback, value, old, target, parentIsArray);


          if (settings.ready && callback) {
            cbwrapper();
          } else if (callback) {
            settings.deferred.push(cbwrapper);
          }
        },
        get: function () {
          return value;
        },
      };

      // don't die trying...
      try {
        Object.defineProperty(target, key, definition);
      } catch (e) {
        // console.log(e.toString(), e.stack);
      }


      // finally, set the target aka the returned value's property to the value
      // we're iterating over. note that this means the callbacks are fired
      // right away - so we defer the callbacks on first run until the set up is
      // finished.
      if (typeof value === o && value !== null && !Array.isArray(value)) {
        target[key] = extend(target[key] || {}, value, settings, path);
      } else if (Array.isArray(value)) {
        target[key] = extend(new AugmentedArray(callback), value, settings, path);
      } else {
        target[key] = value;
      }
    });

    return target;
  }

  function Bind(obj, mapping) {
    if (!this || this === global) {
      return new Bind(obj, mapping);
    }

    var settings = {
      mapping: mapping,
      deferred: [],
      ready: false,
    };

    extend(this, obj, settings);

    // allow object updates to happen now, otherwise we end up iterating the
    // setter & getter methods, which causes multiple callbacks to run
    settings.ready = true;

    // if there's deferred callbacks, let's hit them now the binding is set up
    if (settings.deferred.length) {
      // note: this callback will fire right away, so the callbacks
      // may not want to directly reference the returned object,
      // but reference the passed in "new" value or `this` keyword
      // this can be worked around by wrapping the following code
      // in a setTimeout(fn, 0) - but this means any changes that are
      // synchonous in the code that creates the bind object, will
      // run *before* this callback loop runs. Basically: race.
      forEach(settings.deferred, function deferreds(fn) {
        fn.call(this);
      }.bind(this));
    }

    return this;
  }

  // returns a vanilla object - without setters & getters
  Bind.prototype.__export = function () {
    function extend(target, object) {
      forEach(Object.getOwnPropertyNames(object), function (key) {
        var value = object[key];

        // ignore properties on the prototype (pretty sure there's a better way)
        if (Bind.prototype[key]) {
          return;
        }

        if (typeof value === o && value !== null && !Array.isArray(value)) {
          target[key] = extend(target[key] || {}, value);
        } else {
          target[key] = value;
        }
      });
      return target;
    }

    return extend({}, this);
  };

  return Bind;

})(this);

if (typeof exports !== 'undefined') {
  module.exports = Bind;
}

