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
      cats: ['one', 'two', 'three'],
    }, {
      'me.cats': {
        dom: '#select',
        transform: function (cat) {
          console.log('cat', cat.map(_ => `<option>${_}</option>`).join(','));
          spy(cat);
          return cat.map(_ => `<option>${_}</option>`).join(',');
          // return cat.map(function (_) {
          //   return '<option>' + _.name + '</option>';
          // });
        }
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
      assert.equal(data.ts, 'three', 'ts: ' + data.ts);
      done();
    }, 10);


  });
});
