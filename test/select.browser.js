'use strict';
var assert = require('assert');
var sinon = require('sinon');
var html = require('./html');
var Bind = require('../');

/* globals describe, beforeEach, it */
describe('select', function () {
  var data;
  var spy;

  beforeEach(function () {
    html(window.__html__['test/select.html']);
    spy = sinon.spy();

    data = new Bind({
      cats: null,
    }, {
      cats: {
        dom: '#select',
				callback: spy
      },
    });
  });

  it('should update DOM as defined by data', function () {
    var nodes = document.querySelectorAll('select');
    var found = nodes.length;
    assert.ok(found === 1, 'found ' + found);
    assert.ok(nodes[0].value === 'one', 'found node value: ' + nodes[0].value);
    assert.ok(spy.called, 'spy called ' + spy.callCount);
  });

  it('should update the data when the DOM is changed', function (done) {
    var node = document.querySelector('select');

    node.value = 'three';
    var event = document.createEvent('HTMLEvents');
    event.initEvent('change', true, true);
    node.dispatchEvent(event);

    setTimeout(function () {
      assert.equal(data.cats, 'three', 'cats: ' + data.cats);
      done();
    }, 10);


  });
});
