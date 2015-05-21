/*globals describe:true, assert: true, beforeEach: true, Bind:true, sinon:true, it:true */
var sinon = require('sinon');
var assert = require('assert');
var Bind = require('../');

describe('numbers', function () {
  'use strict';
  var data, spy, spy2, players;

  beforeEach(function () {
    spy = new sinon.spy();
    spy2 = new sinon.spy();
    players = new sinon.spy();

    data = new Bind({
      score: 10,
      players: [{
        name: 'Remy',
        highscore: 300,
      }, {
        name: 'Julie',
        highscore: 350,
      },],
    }, {
      score: spy,
      'players.1.highscore': spy2,
      players: players,
    });
  });

  it('should allow raw value to change', function () {
    data.score = 11;
    assert(data.score === 11);
    data.score++;
    assert(data.score === 12);
  });

  it('should trigger callback on change', function () {
    var callCount = spy.callCount;
    data.score = 11;
    assert(spy.callCount === (callCount + 1));
  });

  it('should trigger callback after init', function () {
    assert(spy.withArgs(10).calledOnce);
  });

  it('should pass callback new value and old', function () {
    assert(spy.withArgs(10).calledOnce);

    data.score = 11;
    assert(spy.withArgs(11).calledOnce);
  });

  it('should support callbacks in advanced mode', function () {
    var data = new Bind({
      score: 10,
    }, {
      score: {
        callback: spy
      }
    });

    data.score = 11;
    assert(spy.withArgs(11).calledOnce);
  });


  it('should trigger on deep object value change', function () {
    data.players[1].highscore++;
    assert(spy2.callCount === 2);
  });

  it('should trigger on array item change', function () {
    var count = players.callCount; // because it's called on initial setup
    data.players.push({ name: 'Ellis', highscore: 50 });
    assert(players.callCount === count + 1, 'new callcount: ' + players.callCount);
  });
});
