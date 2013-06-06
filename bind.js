/*

Simple data to HTML binding.

Requires:

setters/gettings, bind, qSA, getOwnPropertyNames, forEach - basically a decent browser

Arguments:

- obj: this is your data structure that is copied in to the Bind
- mapping: this is a key/value pair of object path to DOM selector

Example:

var data = Bind({
  me: {
    name: "@rem",
    score: 11
  }
}, {
  'me.score': '#score',
  'me.name': '#name'
});

Restrictions:

Only supports simple changes to the object - if you change the structure, then the bindings are lost.

i.e. this won't work:

var data = Bind({...}, {...});

data.me.name = '@leftlogic'; //works
data.me = { // fails
  name: '@rem'
}

*/
var Bind = (function (global) {
"use strict"; // damn jshint & sublime

var $ = document ? document.querySelectorAll.bind(document) : function () {},
    forEach = [].forEach;

function extend(target, object, mapping, _path) {
  if (!_path) { _path = []; }

  Object.getOwnPropertyNames(object).forEach(function (key) {
    var value = object[key];
    var path = [].slice.call(_path);
    path.push(key);

    var elements;
    var callback;
    if (typeof mapping[path.join('.')] === 'function') {
      callback = mapping[path.join('.')];
    } else {
      callback = function (value) {
        if (callback.elements) {
          forEach.call(callback.elements, function (element) {
            element.innerHTML = value;
          });
        }
      };
      callback.elements = $(mapping[path.join('.')] || '☺');
    }

    Object.defineProperty(target, key, {
      configurable: true,
      set: function (v) {
        if (typeof v === "object" && v !== null && !Array.isArray(v)) {
          value = extend(target[key] || {}, v, mapping, path);
        } else {
          value = v;
        }

        if (callback) {
          callback(value);
        }
      },
      get: function () {
        return value;
      }
    });

    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      target[key] = extend(target[key] || {}, value, mapping, path);
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
  this.__mapping = mapping;
  extend(this, obj, mapping);
  return this;
};

Bind.prototype.__mapping = {};

Bind.prototype.__export = function () {
  function extend(target, object) {
    Object.getOwnPropertyNames(object).forEach(function (key) {
      if (Bind.prototype[key]) return;
      var value = object[key];
      if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        target[key] = extend(target[key] || {}, value);
      } else if (!Bind.prototype[value]) {
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

