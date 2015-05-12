// author: Remy Sharp
// license: http://rem.mit-license.org/
// source: https://github.com/remy/bind/

var Bind = (function Bind(global) {
  'use strict';
  // support check
  if (!Function.bind) {
    throw new Error('Prerequisite APIs not available: Function.bind');
  }

  // this is a conditional because we're also supporting node environment
  var $;
  try { $ = document.querySelectorAll.bind(document); } catch (e) {}
  var array = [];
  var o = 'object';
  var pass = function (v) {return v; };
  var tryit = function (fn) {
    return function () {
      try {
        return fn.apply(this, arguments);
      } catch (e) {
        console.error(e.stack ? e.stack : e);
      }
    };
  };

  // via https://github.com/codemix/fast.js/blob/master/array/forEach.js
  function forEach(subject, fn) {
    var length = subject.length;
    for (var i = 0; i < length; i++) {
      fn(subject[i], i, subject);
    }
  }

  // create an array like object that mirrors all the modifying array methods
  // so that we can hook into and call our callback action when it's changed.
  function AugmentedArray(callback, settings) {
    var methods = 'pop push reverse shift sort splice unshift'.split(' ');
    this.__callback = function () {
      return callback.apply(this, arguments);
    };
    forEach(methods, function eachArrayMethod(method) {
      this[method] = function augmentedMethod() {
        // create a copy of the object before the modification to
        // pass to the callback as the "old" version
        var before = this.slice(0);

        // flag that we're about to change (used later in bind)
        this.__dirty = true;
        var ret = array[method].apply(this, arguments);
        if (this.__callback && settings.ready) {
          this.__callback.call(this, this.slice(0), before);
        }

        delete this.__dirty;
        return ret;
      };
    }.bind(this));

    var length = this.length;

    Object.defineProperty(this, 'length', {
      configurable: false, // don't allow it to be deleted
      enumerable: true,
      set: function (v) {
        if (this.__dirty) {
          length = v;
          // now let the native array do it's thing
          return;
        }
        var newLength =  v * 1; // do a simple coersion
        // note: if `v` is a fraction, then it *should* throw an exception
        // "Invalid array length" but we don't support right now.
        if (length !== newLength) {
          if (newLength > length) {
            this.push.apply(this, new Array(newLength - length));
          } else {
            this.splice(newLength);
          }

          length = newLength;
        }

        return v;
      },
      get: function () {
        return length;
      },
    });
    return this;
  }

  // then lift the rest of the methods from a new array object
  AugmentedArray.prototype = [];

  function extend(target, object, settings, _path, parent) {
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
      var transform = pass;
      var parse = pass;

      // now create a path, so that obj { user: { name: xxx }} is
      // user.name when joined later.
      path.push(key);

      var selector = settings.mapping[path.join('.')];

      // then we've got an advanced config - rather than 1-1 mapping
      if (selector && selector.toString() === '[object Object]') {
        if (selector.callback) {
          callback = selector.callback;
        }
        if (selector.transform) {
          transform = tryit(selector.transform);
        }
        if (selector.parse) {
          parse = tryit(selector.parse);
        }
        // finally assign the DOM selector to the selector var so code
        // can continue as it was
        selector = selector.dom;
      }

      // look for the path in the mapping arg, and if the gave
      // us a callback, use that, otherwise...
      if (typeof selector === 'function') {
        callback = selector;
      } else if (typeof selector === 'string') {
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
        var oldCallback = callback;
        callback = function (value) {
          // make it a live selection
          elements = $(selector || '☺');
          if (elements) {
            forEach(elements, function (element) {
              // don't try to update the dom if the change came from the DOM in
              // the first place (see where `dirty = true`)
              if (element.__dirty) {
                return;
              }

              if (valueSetters.indexOf(element.nodeName) !== -1) {
                element.value = transform(value);
              } else {
                // to detect both arrays & augmented arrays
                if (!value instanceof Array) {
                  value = [value];
                }
                var html = '';
                forEach(value, function (value) {
                  html += transform(value);
                });
                element.innerHTML = html;
              }
            });
          }
          if (oldCallback) {
            oldCallback.apply(target, arguments);
          }
        };

        // let's make the binding two way...
        // note that this doesn't support event delegation
        forEach(elements, function (element) {
          if (element.nodeName === 'INPUT' || element.nodeName === 'SELECT') {
            // FIXME can't handle multiple checkbox values
            element.addEventListener('input', function () {
              // we set a dirty flag against this dom node to prevent a
              // circular update / max stack explode
              this.__dirty = true;
              var result;
              if (typeof target[key] === 'number') {
                result = parse(this.value * 1);
              } else {
                result = parse(this.value);
              }

              // if parse didn't return anything, then assume this is a mistake
              // but...you know what they say about assumption being the mother
              // of all fucks ups?
              if (result === undefined) {
                result = this.value;
              }

              target[key] = result;

              this.__dirty = false;
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
          var parentIsArray = parent instanceof AugmentedArray;

          // if the parent object is an array - then capture the old state too
          // (later in dev) ...because?
          if (parentIsArray) {
            oldparent = parent.slice(0);
          }

          // if the value we're setting is an object, enumerate the properties
          // and apply new setter & getters, returning our bound object
          if (settings.ready && typeof v === o && v !== null && !Array.isArray(v)) {
            value = extend(target[key] || {}, v, settings, path, target);
          } else if (Array.isArray(v)) {
            var tmp = new AugmentedArray(callback, settings);
            tmp.push.apply(tmp, v);
            value = tmp;
          } else {
            value = v;
          }

          // only fire the callback immediately when the initial data binding
          // is set up. If it's not, then defer until complete
          var cbwrapper = function initValue(callback, value, old, target, parentIsArray) {
            callback(value, old);

            if (parentIsArray && parent.__callback) {
              parent.__callback(parent.slice(0), oldparent);
            }
          }.bind(null, callback, value, old, target, parentIsArray);

          if (settings.ready && callback) {
            // this is a run-time change
            cbwrapper();
          } else if (callback) {
            // defer the callback until we're fully booted
            settings.deferred.push(cbwrapper);
          } else if (settings.ready) {
            // but there's no callback, check the parent first
            if (parentIsArray && parent.__callback) {
              parent.__callback(parent, oldparent);
            }
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
        target[key] = extend(target[key] || {}, value, settings, path, target);
      } else if (Array.isArray(value)) {
        target[key] = extend(new AugmentedArray(callback, settings), value, settings, path, target);
      } else if (target instanceof AugmentedArray) {
        // do nothing
      } else {
        target[key] = value;
      }
    });

    if (target instanceof AugmentedArray) {
      target.push.apply(target, object);
    }

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

