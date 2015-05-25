'use strict';
var assert = require('assert');
var sinon = require('sinon');
var html = require('./html');
var Bind = require('../');

/*globals describe, assert, beforeEach, it */
describe('transform with bind', function () {
  var data;

  beforeEach(function () {
    html(window.__html__['test/transform.html']);

    data = Bind({
      cats: [
      {
        name: 'missy',
        type: 'black long haired',
      }, {
        name: 'dizzy',
        type: 'tabby',
      }, {
        name: 'ninja',
        type: 'black and white',
      },
      ],
    }, {
      cats: {
        dom: '#cats',
        transform: function (value) {
          return '<li><strong>' + value.name + '</strong>: <em>' + value.type + '</em></li>';
        },
      },
    });
  });

  it('should update DOM as defined by transform', function () {
    var nodes = document.querySelectorAll('#cats li');
    var found = nodes.length;
    assert.ok(found === 3, 'found ' + found);
  });

  it('should update the DOM when values change', function () {
    data.cats.push({ name: 'nap', type: 'black & white' });
    var nodes = document.querySelectorAll('#cats li');
    var found = nodes.length;
    assert.ok(found === 4, 'found ' + found);
  });

  it('should support parse before object updates', function (done) {
    var parse = sinon.spy(function (v) {
      return 'XXX';
    });
    var transform = sinon.spy(function (v) {
      return 'sam';
    });

    var data = Bind({
      name: 'nap',
    }, {
      name: {
        dom: '#name',
        parse: parse,
        transform: transform,
      },
    });

    var node = document.querySelector('#name');

    var tCallCount = transform.callCount;
    data.name = 'foo';
    assert.ok(node.value === 'sam', 'real node value: ' + node.value);
    assert.ok(transform.callCount === tCallCount + 1, 'transform called ' + transform.callCount);

    var pCallCount = parse.callCount;
    node.value = 'bar';
    var event = document.createEvent('HTMLEvents');
    event.initEvent('input', true, true);
    node.dispatchEvent(event);

    setTimeout(function () {
      assert.ok(parse.callCount === pCallCount + 1, 'parse called ' + parse.callCount);
      assert.ok(data.name === 'XXX', node.value + ' & ' + data.name);
      done();
    }, 10);
  });

  it('should support text fields', function (done) {
    var data = Bind({
      name: 'julie',
    }, {
      name: {
        dom: '#name',
        transform: function (value) {
          return this.safe(value);
        },
      },
    });

    var node = document.querySelector('#name');
    assert.ok(node.value === data.name, 'found ' + data.name);

    node.value = 'remy';
    var event = document.createEvent('HTMLEvents');
    event.initEvent('input', true, true);
    node.dispatchEvent(event);

    setTimeout(function () {
      assert.ok(data.name === 'remy', 'found ' + data.name);
      done();
    }, 10);

  });
});