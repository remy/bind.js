// author: Remy Sharp
// license: http://rem.mit-license.org/
// source: https://github.com/remy/bind/
/* eslint-env browser */
var Bind = (function Bind(global) {
  'use strict';
  // support check
  if (!Function.bind || !Object.defineProperty) {
    throw new Error('Prerequisite APIs not available.');
  }

  var debug = false;

  var array = [];
  var isArray = Array.isArray;
  var o = 'object';
  var pass = function (v) {
    return v;
  };
  var tryit = function (fn) {
    return function () {
      try {
        return fn.apply(this, arguments);
      } catch (e) {
        console.error(e.stack ? e.stack : e);
      }
    };
  };

  function safe(str) {
    return (str + '').replace(/[<>]/g, function (m) {
      return {
        '>': '&gt;',
        '<': '&lt;',
      }[m];
    });
  }

  // quicker forEach, also means I can use the same forEach on nodes, etc.
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
    forEach(methods, function eachArrayMethod(method) {
      this[method] = function augmentedMethod() {
        // flag that we're about to change (used later in bind)
        this.__dirty = true;

        var ret = __export({}, array[method].apply(this, arguments));
        delete this.__dirty;
        if (callback && settings.ready) {
          callback(this);
        }

        return ret;
      }.bind(this);
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
        var newLength = v * 1; // do a simple coersion
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

  // this is the main body of the bind library, and it is called recursively
  // as we go deeper into the object.
  // target is our result
  // object is the source values
  // settings is bind's settings (which contains mapping and callbacks)
  // _path is a representation of the object path from the root
  function extend(target, object, settings, _path) {
    if (!_path) { _path = []; }

    if (settings.ready && object.__callback) {
      return target;
    }

    // don't rebind
    if (object instanceof Bind) {
      return object;
    }

    // this is a conditional because we're also supporting node environment
    var $;
    try {
      var context = settings.context || document;
      $ = context.querySelectorAll.bind(context);
    } catch (e) {}

    // loop through each property, and make getters & setters for
    // each type of "regular" value. If the key/value pair is an
    // object, then recursively call extend with the target and
    // object as the next level down.
    forEach(Object.getOwnPropertyNames(object), function eachProp(key) {
      // ignore our special hooks
      if (key === '__callback') {
        return;
      }

      var value = object[key];
      // create a new copy of the mapping path
      var path = [].slice.call(_path);
      var callback;
      var transform = function (v) {
        return safe(v);
      };
      var parse = pass;

      // now create a path, so that obj { user: { name: xxx }} is
      // user.name when joined later.
      path.push(key);

      var selector = settings.mapping[path.join('.')];

      if (debug) {
        console.log('key: %s / %s', key, path.join('.'), selector);
      }

      // then we've got an advanced config - rather than 1-1 mapping
      if (selector && selector.toString() === '[object Object]') {
        if (selector.callback) {
          callback = selector.callback;
        }
        if (selector.transform) {
          transform = tryit(selector.transform.bind({ safe: safe }));
        }
        if (selector.parse) {
          parse = tryit(selector.parse);
        }
        // finally assign the DOM selector to the selector var so code
        // can continue as it was
        selector = selector.dom;
      }

      var elements;
      if (typeof selector === 'string') {
        // cache the matched elements. Note the :) is because qSA won't allow an
        // empty (or undefined) string so I like the smilie.
        elements = $(selector || '☺');
      } else if (global.Element && selector instanceof global.Element) {
        elements = [selector];
      }

      // look for the path in the mapping arg, and if the gave
      // us a callback, use that, otherwise...
      if (typeof selector === 'function') {
        callback = selector;
      } else if (elements) {
        if (elements.length === 0) {
          console.warn('No elements found against "' + selector + '" selector');
        }

        // create a callback that loops over *all* the elements
        // matched from the selector (set up below), that checks
        // the node type, and either sets the input.value or
        // element.innerHTML to the value
        var valueSetters = ['OPTION', 'INPUT', 'PROGRESS', 'TEXTAREA'];

        if (value === null || value === undefined) {
          if (valueSetters.indexOf(elements[0].nodeName) !== -1) {
            if (elements[0].hasOwnProperty('checked')) {
              value = parse(elements[0].value === 'on' ? elements[0].checked : elements[0].value);
            } else {
              value = parse(elements[0].value);
            }
          } else {
            value = parse(elements[0].innerHTML);
          }
        }

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
                // TODO select[multiple]
                // special case for multi-select items
                var result = transform(value, target);
                if (element.type === 'checkbox') {
                  if (value instanceof Array) {
                    var found = value.filter(function (value) {
                      if (value === element.value) {
                        element.checked = element.value === value;
                        return true;
                      }
                    });
                    if (found.length === 0) {
                      element.checked = false;
                    }
                  } else if (typeof value === 'boolean') {
                    element.checked = value;
                  }
                } else if (element.type === 'radio') {
                  element.checked = element.value === result;
                } else if (typeof element.value === 'number') {
                  try {
                    element.value = result * 1;
                  } catch (e) {
                    console.error(e.message);
                  }
                } else {
                  element.value = result;
                }
              } else {
                // to detect both arrays & augmented arrays
                if (!(value instanceof Array)) {
                  value = [value];
                }
                var html = [];

                forEach(value, function (value) {
                  html.push(transform(value, target));
                });
                // peek the first item, if it's a node, append
                // otherwise set the innerHTML
                if (typeof html[0] === 'object') {
                  element.innerHTML = ''; // blow away original
                  html.forEach(function (el) {
                    element.appendChild(el);
                  });
                } else {
                  element.innerHTML = html.join('');
                }
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
          if (element.nodeName === 'INPUT' || element.nodeName === 'SELECT' || element.nodeName === 'TEXTAREA') {

            // build up the event handler function
            var oninput = function () {
              // we set a dirty flag against this dom node to prevent a
              // circular update / max stack explode
              this.__dirty = true;
              var result;
              if (element.type === 'checkbox') {
                var inputs = (element.form || document).querySelectorAll('input[name="' + element.name + '"][type="checkbox"]');
                if (target[key] instanceof Array) {
                  var results = [];
                  forEach(inputs, function (input) {
                    if (input.checked) {
                      results.push(parse(input.value === 'on' ? input.checked : input.value));
                    }
                  });
                  result = results;
                } else {
                  result = parse(this.value === 'on' ? this.checked : this.value);
                }
              } else {
                if (element.type === 'radio') {
                  result = parse(this.value === 'on' ? this.checked : this.value);
                }
                if (typeof target[key] === 'number') {
                  result = parse(this.value * 1);
                } else {
                  result = parse(this.value);
                }
              }

              // if parse didn't return anything, then assume this is a mistake
              // but...you know what they say about assumption being the mother
              // of all fucks ups?
              if (result === undefined) {
                result = this.value;
              }

              target[key] = result;

              this.__dirty = false;
            };

            var event = {
              // select: 'change',
              checkbox: 'change',
              radio: 'change',
            }[element.type];

            element.addEventListener(event || 'input', oninput);
          }
        });
      }

      if (callback) {
        path.reduce(function (prev, curr, i, all) {
          if (!prev[curr]) {
            prev[curr] = {};
          }

          // if we're at the tip then add the callback
          if (i === all.length - 1) {
            prev[curr].__callback = callback;
          }

          return prev[curr];
        }, settings.callbacks);

      }

      // now that the callback has been configured, wrap it to ensure that
      // it's always callable, but also then fires a callback on it's parent
      var findCallback = function findCallback(value) {
        var callbacks = [];
        var values = [];
        var instance = settings.instance;
        var dirty = false;
        var always = false;

        if (debug) {
          console.log('> finding callback for %s', key, path);
        }

        path.reduce(function (prev, curr, i) {
          if (prev && prev[curr] && curr) {
            instance = instance[curr];

            if (instance === null || instance === undefined) {
              return prev[curr] || {};
            }
            if (typeof prev[curr].__callback === 'function') {
              var v = i === path.length - 1 ? value : instance;
              if (instance.__dirty) {
                dirty = true;
              }

              if (i === path.length - 1 && prev[curr].__callback) {
                always = {
                  path: path.join('.'),
                  callback: prev[curr].__callback,
                  instance: v,
                };
              }

              if (!dirty) {
                values.push(__export(v instanceof Array ? [] : {}, v));
                callbacks.push(prev[curr].__callback);
              }
            }
            return prev[curr] || {};
          }
        }, settings.callbacks);

        if (!dirty) {
          values.reverse();
          callbacks.reverse().forEach(function (fn, i) {
            fn.call(settings.instance, values[i]);
          });
        }

        if (dirty && always) {
          instance = always.instance;
          always.callback.call(settings.instance, __export(instance instanceof Array ? [] : {}, instance));
        }
      };

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


          // if the value we're setting is an object, enumerate the properties
          // and apply new setter & getters, returning our bound object
          if (settings.ready && typeof v === o && v !== null && !isArray(v) && !v.__callback) {
            value = extend(target[key] ? __export({}, target[key]) : {}, v, settings, path);
          } else if (isArray(v)) {
            value = extend(new AugmentedArray(findCallback, settings), v, settings, path);
          } else {
            value = v;
          }

          if (debug) {
            console.log('set: key(%s): %s -> %s', key, JSON.stringify(old), JSON.stringify(v));
          }

          // expose the callback so that child properties can call the
          // parent callback function
          // if (target[key] instanceof Object && !target[key].__callback) {
          //   target[key].__callback = findCallback;
          // }

          // only fire the callback immediately when the initial data binding
          // is set up. If it's not, then defer until complete
          if (settings.ready) {
            // this is a run-time change
            findCallback(value);
          } else {
            // defer the callback until we're fully booted
            if (typeof settings.mapping[path.join('.')] !== 'undefined') {
              settings.deferred.push(findCallback.bind(target, value, old));
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
        if (debug) {
          console.log('failed on Object.defineProperty', e.toString(), e.stack);
        }
      }

      // finally, set the target aka the returned value's property to the value
      // we're iterating over. note that this means the callbacks are fired
      // right away - so we defer the callbacks on first run until the set up is
      // finished.
      if (typeof value === o && value !== null && !isArray(value)) {
        target[key] = extend(target[key] || {}, value, settings, path);
      } else if (isArray(value)) {
        target[key] = extend(new AugmentedArray(findCallback, settings), value, settings, path);
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

  function __export(target, object) {
    if (!(object instanceof Object)) {
      return object; // this is a primative
    }

    forEach(Object.getOwnPropertyNames(object), function (key) {
      var value = object[key];

      // ignore properties on the prototype (pretty sure there's a better way)
      if (Bind.prototype[key] || key === '__callback') {
        return;
      }

      if (typeof value === o && value !== null && value instanceof Array) {
        target[key] = [].map.call(value, function (value) {
          return value instanceof Object ?
            __export(target[key] || {}, value) :
            value;
        });
      } else if (typeof value === o && value !== null && !isArray(value) &&
        value.toString() === '[Object object]') {
        target[key] = __export(target[key] || {}, value);
      } else {
        target[key] = value;
      }
    });

    return target;
  }


  function Bind(obj, mapping, context) {
    if (!this || this === global) {
      return new Bind(obj, mapping);
    }

    var settings = {
      context: context || global.document,
      mapping: mapping || {},
      callbacks: {},
      deferred: [],
      ready: false,
      instance: this,
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
        fn();
      });
    }

    return this;
  }

  // returns a vanilla object - without setters & getters
  Bind.prototype.__export = function () {
    return __export({}, this);
  };

  return Bind;

})(this);

if (typeof exports !== 'undefined') {
  module.exports = Bind;
}
