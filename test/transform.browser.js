'use strict';
var assert = require('assert');
var html = require('./html');
var Bind = require('../');

/*globals describe, assert, beforeEach, Bind, it */
describe('transform with bind', function () {
  var data;

  beforeEach(function () {
    html(window.__html__['test/transform.html']);

    data = new Bind({
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

  // it('should update data based on element changes', function (done) {
  //   var node = document.querySelector('input.score');
  //   node.value = 10;
  //   var event = document.createEvent('HTMLEvents');
  //   event.initEvent('input', true, true);
  //   node.dispatchEvent(event);

  //   setTimeout(function () {
  //     assert.ok(data.score === 10, 'found ' + data.score + ' - ' + typeof data.score);
  //     done();
  //   }, 10);
  // });

  // it('should support text fields', function (done) {
  //   var node = document.querySelector('input.name');
  //   assert.ok(node.value === data.name, 'found ' + data.name);

  //   node.value = 'remy';
  //   var event = document.createEvent('HTMLEvents');
  //   event.initEvent('input', true, true);
  //   node.dispatchEvent(event);

  //   setTimeout(function () {
  //     assert.ok(data.name === 'remy', 'found ' + data.name);
  //     done();
  //   }, 10);

  // });
});