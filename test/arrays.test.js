/*globals describe:true, assert: true, beforeEach: true, Bind:true, sinon:true, it:true */
var sinon = require('sinon');
var assert = require('assert');
var bind = require('../');

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

    data = bind({
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
    });
  });

  it('should have called the callback on initialisation', function () {
    // note that call count is 2 as there's the instanciation
    var data = bind({
      cats: 'sam nap'.split(' '),
    }, {
      cats: spy,
    })

    assert.ok(spy.calledOnce, spy.callCount);
  });

  it('should bind to simple arrays [1,2,3]', function (done) {
    var data = bind([1, 2, 3], {
      0: sinon.spy(function (newval) {
        spy();
        assert.ok(newval === 1);
      }),
      1: sinon.spy(function (n) {
        spy();
        assert.ok(n === 2);
      }),
    });

    assert.ok(data.length === 3);

    setTimeout(function () {
      assert.ok(spy.callCount === 2);
      done();
    }, 10);
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
    var data = bind({
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
    var data = bind({
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

  it('should callback on push', function () {
    var length = data.cats.length;

    assert.ok(callbacks.cats.calledOnce, 'call count: ' + callbacks.cats.callCount);

    data.cats.push({
      name: 'Jed',
    });

    assert.ok('length correct', data.cats.length === length + 1);
    assert.ok(callbacks.cats.calledTwice);
  });

  it('should callback on individual item change', function () {
    var data = bind({
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

  it('should bubble change to array callback when individual array prop is changed', function () {
    assert.ok(callbacks.cats.calledOnce);
    data.cats[0].name = 'dennis';
    assert.ok(data.cats[0].name === 'dennis');
    assert.ok(callbacks.cats.calledTwice, 'callback was called ' + callbacks.cats.callCount);
  });

  it('should support every array method', function (done) {
    var data = bind({
      cats: 'ninja dizzy missy'.split(' ')
    }, {
      cats: spy
    });
    setTimeout(function () {
      assert.ok(spy.callCount === 1);
      assert.ok(data.cats.pop() === 'missy');
      assert.ok(spy.callCount === 2);
      assert.ok(data.cats.shift() === 'ninja');
      assert.ok(spy.callCount === 3);
      assert.ok(data.cats.unshift('nap') === data.cats.length);
      assert.ok(spy.callCount === 4);

      //etc

      done();
    }, 10);
  });

  it('should support being entirely replaced', function () {
    var single = sinon.spy();
    var data = bind({
      cats: 'ninja dizzy missy'.split(' ')
    }, {
      cats: spy,
      'cats.0': single
    });

    var count = single.callCount;
    data.cats = 'nap sam'.split(' ');
    assert.ok(single.calledWith('nap'));
    assert.ok(count + 1 === single.callCount);
    data.cats[0] = 'prince';
    assert.ok(single.calledWith('prince'));
  });
});
