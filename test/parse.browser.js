/*globals describe:true, assert: true, beforeEach: true, Bind:true, sinon:true, it:true */
var sinon = require('sinon');
var assert = require('assert');
var Bind = require('../');
var html = require('./html');

describe('parse', function () {
  'use strict';
  var callbacks;
  var data;
  var spy;

  beforeEach(function () {
    html(window.__html__['test/transform.html']);
    spy = sinon.spy();
    data = Bind({
      name: 'remy',
      location: 'Brighton',
    }, {
      name: {
        dom: '#name',
        parse: function (v) {
          return v.toLowerCase();
        },
      },
      location: {
        dom: '#location',
        parse: function (v) {
          // intentially don't return
          v.toLowerCase();
        },
      }
    })
  });

  it('should parse incoming data', function (done) {
    var node = document.querySelector('#name');

    node.value = 'Remy Sharp';
    var event = document.createEvent('HTMLEvents');
    event.initEvent('input', true, true);
    node.dispatchEvent(event);

    setTimeout(function () {
      assert.ok(data.name === 'remy sharp', 'name is' + data.name);
      done();
    }, 10);

  });

  it('should support non returning parse function', function (done) {
    var node = document.querySelector('#location');

    node.value = 'Worthing';
    var event = document.createEvent('HTMLEvents');
    event.initEvent('input', true, true);
    node.dispatchEvent(event);

    setTimeout(function () {
      assert.ok(data.location === 'Worthing', 'location is ' + data.location);
      done();
    }, 10);

  });
});