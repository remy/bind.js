'use strict';
var sinon = require('sinon');
var assert = require('assert');
var Bind = require('../');

/* globals describe, assert, Bind, sinon, it */
describe('export', function () {
  it('returns vanilla object', function () {
    var spy = sinon.spy();
    var o = {
      name: 'remy',
      complex: {
        age: 20,
        location: 'house',
      },
    };
    var data = new Bind(o, {
      name: spy,
    });

    assert.ok(spy.calledWith('remy'), 'initial data set');
    assert.ok(JSON.stringify(o) === JSON.stringify(data.__export()),
      'export returns same object');
  });


});