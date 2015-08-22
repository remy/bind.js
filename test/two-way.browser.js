'use strict';
var sinon = require('sinon');
var assert = require('assert');
var html = require('./html');
var Bind = require('../');

/*globals describe, assert, beforeEach, Bind, sinon, it */
describe('two way data bind', function () {
  var data;

  beforeEach(function () {
    html(window.__html__['test/two-way.html']);

    data = Bind({
      score: 10,
      name: 'Julie',
      body: 'Some really long\nstatement about stuff',
    }, {
      score: '.score',
      name: '.name',
      body: 'textarea.body',
    });
  });

  it('should find selectors', function () {
    var nodes = document.querySelectorAll('.score');
    assert.equal(nodes.length, 3, 'found DOM nodes: ' + nodes.length);
  });

  it('should update DOM to data values', function () {
    var target = data.score = 10;
    var nodes = document.querySelectorAll('.score');
    var found = 0;
    [].forEach.call(nodes, function (el) {
      var value = null;
      if (el.nodeName === 'SPAN') {
        value = parseInt(el.innerHTML, 10);
      } else {
        value = parseInt(el.value, 10);
      }

      if (value === target) {
        found++;
      }
    });
    assert.ok(found === 3, 'found ' + found);
  });

  it('should update textarea elements', function () {
    var ta = document.querySelector('textarea');
    assert.equal(ta.value, data.body, 'textarea was updated');
  });

  it('should update data based on element changes', function (done) {
    var node = document.querySelector('input.score');
    node.value = 10;
    var event = document.createEvent('HTMLEvents');
    event.initEvent('input', true, true);
    node.dispatchEvent(event);

    setTimeout(function () {
      assert.ok(data.score === 10, 'found ' + data.score + ' - ' + typeof data.score);
      done();
    }, 10);
  });

  it('should support text fields', function (done) {
    var node = document.querySelector('input.name');
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