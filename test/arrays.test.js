/*globals describe:true, assert: true, beforeEach: true, Bind:true, sinon:true, it:true */
var sinon = require('sinon');
var assert = require('assert');
var Bind = require('../');

console.log('---------');

describe('arrays', function () {
  'use strict';
  var callbacks;
  var data;
  var spy;

  beforeEach(function () {
    spy = sinon.spy();

    callbacks = {
      cats: sinon.spy(),
      dizzy: sinon.spy(),
      city: sinon.spy(),
    };

    data = new Bind({
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
      cats: callbacks.cats,
      'cats.0.name': callbacks.dizzy,
    });
  })

  it('should bind to simple arrays [1,2,3]', function (done) {
    var data = new Bind([1, 2, 3], {
      0: sinon.spy(function (newval) {
        assert.ok(newval === 1);
      }),
      1: sinon.spy(function (n) {
        assert.ok(n === 2);
      }),
    });

    assert.ok(data.length === 3);

    setTimeout(done, 10);
  });

  it('should trigger change when array length changes', function (done) {
    var callback = sinon.spy(function (array) {
      var count = callback.callCount;
      if (count === 1) {
        assert.ok(array.length === 3, 'expected 3, is: ' + array.length);
      } else if (count === 2) {
        assert.ok(array.length === 2, 'expected 2, is: ' + array.length);
      } else if (count === 3) {
        assert.ok(array.length === 1, 'expected 1, is: ' + array.length);
      }
    });

    // `data` - getting rather meta now...
    var data = new Bind({
      data: [1, 2, 3],
    }, {
      data: callback,
    });

    data.data.shift();

    data.data.pop();
    done();
  });

  it('should trigger changes on individual item changes', function (done) {
    var spy = sinon.spy();
    var data = new Bind({
      a: [1, 2, 3],
    }, {
      'a.0': spy,
    });

    sinon.assert.callCount(spy, 1);
    data.a[0] = 10;
    sinon.assert.callCount(spy, 2);
    assert.ok(data.a[0] === 10);

    done();
  });

  it('should have called the callback on initialisation', function () {
    assert.ok(callbacks.cats.calledOnce);
  });

  it('should callback on push', function () {
    var length = data.cats.length;

    assert.ok(callbacks.cats.calledOnce);

    data.cats.push({
      name: 'Jed',
    });

    assert.ok('length correct', data.cats.length === length + 1);
    assert.ok(callbacks.cats.calledTwice);
  });

  it('should callback on individual item change', function () {
    assert.ok(callbacks.dizzy.calledOnce);
    data.cats[0].name = 'Jed';
    assert.ok(callbacks.dizzy.calledTwice);
    assert.ok(data.cats[0].name === 'Jed');
  });

  it('should allow the length to be changed', function () {
    assert.ok(callbacks.cats.calledOnce);
    assert.ok(data.cats.length === 3, 'length is ' + data.cats.length);
    data.cats.length = 2;
    assert.ok(data.cats.length === 2, 'new length is ' + data.cats.length);
    assert.ok(callbacks.cats.calledTwice, 'callback was called ' + callbacks.cats.callCount);

    data.cats.length = 10;
    assert.ok(data.cats.length === 10, 'new length is ' + data.cats.length);
    assert.ok(callbacks.cats.calledThrice, 'callback was called ' + callbacks.cats.callCount);
    assert.ok(data.cats[2] === undefined, 'undefined found on index 2');
  });

});
