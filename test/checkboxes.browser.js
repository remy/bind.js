'use strict';
var assert = require('assert');
var sinon = require('sinon');
var html = require('./html');
var Bind = require('../');

/*globals describe, assert, beforeEach, it */
describe('checkboxes', function () {
  var data;
  var spy;

  beforeEach(function () {
    html(window.__html__['test/checkboxes.html']);
    spy = sinon.spy();

    data = Bind({
      ts: ['one', 'two'],
    }, {
      ts: {
        dom: 'input[type=checkbox]',
        callback: spy,
      },
    });
  });

  it('should update DOM as defined by data', function () {
    var nodes = document.querySelectorAll('input:checked');
    var found = nodes.length;
    assert.ok(found === 2, 'found ' + found);
    assert.ok(spy.called, 'spy called ' + spy.callCount);
  });

  it('should update the data when the DOM is changed', function (done) {
    var node = document.querySelector('input[value="three"]');

    node.checked = true;
    var event = document.createEvent('HTMLEvents');
    event.initEvent('change', true, true);
    node.dispatchEvent(event);

    setTimeout(function () {
      assert.deepEqual(data.__export(), { ts: ['one', 'two', 'three'] }, JSON.stringify(data.__export()));
      done();
    }, 10);


  });
});
