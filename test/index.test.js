'use strict';
var sinon = require('sinon');
var assert = require('assert');
var Bind = require('../');

/*globals describe, assert, beforeEach, Bind, sinon, it */
var data;
var callbacks = {};
var spy;

beforeEach(function (done) {
  spy = sinon.spy(function (n) {
    return n;
  });

  var noop = function () {
    return sinon.spy(function () {
      // console.log.apply(console, [].slice.apply(arguments));
    });
  };

  callbacks = {
    name: noop(),
    cats: noop(),
    dizzy: noop(),
    city: noop(),
  };

  data = new Bind({
    name: 'remy',
    location: {
      city: 'Brighton',
      county: 'East Sussex',
    },
    cats: [{
      name: 'dizzy',
      colour: 'tabby',
    }, {
      name: 'ninja',
      colour: 'black & white',
    }, {
      name: 'missy',
      colour: 'black',
    }, ],
  }, { // here be the mapping
    name: callbacks.name,
    cats: callbacks.cats,
    'cats.0.name': callbacks.dizzy,
    'location.city': callbacks.city,
  });

  setTimeout(done, 10);
});

describe('object acts as object', function () {
  it('initial value set', function () {
    assert.ok(data.name === 'remy');
  });

  it('changes simple values', function () {
    data.name = 'julie';
    assert.ok(data.name === 'julie');
  });

  it('delete property', function () {
    assert.ok(data.name === 'remy');
    delete data.name;
    assert.ok(data.name === undefined);
  });
});

describe('data.prop change & callback', function () {
  it('captures changes', function () {
    assert.ok(callbacks.name.calledOnce, 'callback has fired on init');
    data.name = 'julie';
    assert.ok(callbacks.name.calledTwice, 'callback fired after change');
    data.name = 'remy';
    assert.ok(callbacks.name.calledThrice, 'callback fired again after change');
    assert.ok(data.name === 'remy');
  });
});

describe('deep object change', function () {
  it('captures deep changes', function () {
    assert.ok(callbacks.city.calledOnce);
    data.location.city = 'London';
    assert.ok(callbacks.city.calledTwice);
  });
});

describe('setting arbitrary objects', function () {
  it('allows object to be set as property', function (done) {
    var count = callbacks.city.callCount;
    data.location = { 'city': 'London' };
    assert.ok(callbacks.city.callCount === count + 1, 'called: ' + callbacks.city.callCount + ' vs ' + count);
    done();
  });
});
