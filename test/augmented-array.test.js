/*global describe, assert, beforeEach: true, Bind, sinon, it*/
var sinon = require('sinon');
var assert = require('assert');
var bind = require('../');

describe('augmented array', function () {
  'use strict';
  var data;
  var spy;

  beforeEach(function () {
    spy = sinon.spy();

    data = bind({
      list: [1,2,3]
    }, {
      list: spy,
    });
  });

  it('push', function () {
    var cursor = spy.args.length;
    var count = spy.callCount;
    assert.ok(data.list.length === 3, 'length is right');
    data.list.push(4);
    assert.ok(spy.callCount === count + 1, 'call count increased');
    assert.ok(data.list.length === 4, 'length is right');
    assert.ok(spy.args[cursor][0].length === 4, 'passed in was 4');
  });

  it('pop', function () {
    var cursor = spy.args.length;
    var count = spy.callCount;
    data.list.pop();
    assert.ok(spy.callCount === count + 1, 'call count increased');
    assert.ok(data.list.length === 2, 'length is right');
    assert.ok(spy.args[cursor][0].length === 2, 'new array accepted');
  });

  it('shift', function () {
    var cursor = spy.args.length;
    var count = spy.callCount;
    var first = data.list.shift();
    assert.ok(spy.callCount === count + 1, 'call count increased');
    assert.ok(data.list.length === 2, 'length is right');
    assert.ok(spy.args[cursor][0].length === 2, 'new array accepted');
    assert.ok(first === 1, 'got first value');
  });

  it('unshift', function () {
    var cursor = spy.args.length;
    var count = spy.callCount;
    data.list.unshift(0);
    assert.ok(spy.callCount === count + 1, 'call count increased');
    assert.ok(data.list.length === 4, 'length is right');
    assert.ok(spy.args[cursor][0].length === 4, 'new array accepted');
    assert.ok(spy.args[cursor][0][0] === 0, 'got first value');
  });

  it('splice', function () {
    var cursor = spy.args.length;
    var count = spy.callCount;
    data.list.splice(1, 1);
    assert.ok(spy.callCount === count + 1, 'call count increased');
    assert.ok(data.list.length === 2, 'length is right');
    assert.ok(spy.args[cursor][0].length === 2, 'new array accepted');
    assert.ok(spy.args[cursor][0].toString() === '1,3', 'got first value');
  });
});


describe('augmented array containing binds', function () {
  'use strict';
  var data;
  var spy;

  beforeEach(function () {
    function makeBind(n) {
      return bind({
        data: n,
      }, {
        data: function () {}
      });
    }

    spy = sinon.spy();

    data = bind({
      list: [1,2,3].map(makeBind)
    }, {
      list: spy,
    });
  });

  it('shift', function () {
    var cursor = spy.args.length;
    var count = spy.callCount;
    data.list.shift();
    assert.ok(spy.callCount === count + 1, 'call count increased');
    assert.ok(data.list.length === 2, 'length is right');
    assert.ok(spy.args[cursor][0].length === 2, 'new array accepted');
    var values = data.list.map(function (v) {
      return v.data;
    }).join(',');
    console.log(values);
    assert.equal(values, '2,3', 'source data is correct');
  });
});
