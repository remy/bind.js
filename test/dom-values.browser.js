'use strict';
var assert = require('assert');
var html = require('./html');
var Bind = require('../');

/*globals describe, assert, beforeEach, Bind, it */
describe('DOM values informing bind', function () {
  var data;

  beforeEach(function () {
    html(window.__html__['test/dom-values.html']);

    data = new Bind({
      score: undefined,
      price: null,
    }, {
      score: '.score',
      price: {
        dom: '.price',
        parse: function (v) {
          return parseFloat(v.replace(/£/, ''));
        },
        transform: function (v) {
          return '£' + v;
        },
      },
    });
  });

  it('should find selectors', function () {
    var nodes = document.querySelectorAll('.score');
    assert.equal(nodes.length, 2, 'expected to find two .score els');
  });

  it('should update bind values based on DOM', function () {
    assert.equal(data.score, '10', 'bind value is correct: ' + data.score);
    assert.ok(data.price === 100, 'price is right: ' + data.price);
  });
});