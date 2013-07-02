var Bind = require('../bind');
var assert = require('assert');
var sinon = require('sinon');


describe('Bind', function(){
  var data,
      callbacks = {};

  beforeEach(function(done){
    var noop = function () {
      return sinon.spy(function () {
        // console.log.apply(console, [].slice.apply(arguments));
      });
    };

    callbacks = {
      name: noop(),
      cats: noop(),
      dizzy: noop(),
      city: noop()
    };

    data = new Bind({
      name: 'remy',
      location: {
        city: 'Brighton',
        county: 'East Sussex'
      },
      cats: [{
        name: 'dizzy',
        colour: 'tabby'
      }, {
        name: 'ninja',
        colour: 'black & white'
      }, {
        name: 'missy',
        colour: 'black'
      }]
    }, { // here be the mapping
      'name': callbacks.name,
      'cats': callbacks.cats,
      'cats.0.name': callbacks.dizzy,
      'location.city': callbacks.city
    });

    setTimeout(done, 10);
  });

  describe('object acts as object', function () {
    it('initial value set', function () {
      assert.ok(data.name === 'remy');
    });

    it('changes simple values', function () {
      data.name = 'julie';
      assert.ok(data.name === 'julie');
    });

    it('delete property', function () {
      assert.ok(data.name === 'remy');
      delete data.name;
      assert.ok(data.name === undefined);
    });
  });

  describe('data.prop change & callback', function(){
    it('captures changes', function(){
      assert.ok(callbacks.name.calledOnce, 'callback has fired on init');
      data.name = 'julie';
      assert.ok(callbacks.name.calledTwice, 'callback fired after change');
      data.name = 'remy';
      assert.ok(callbacks.name.calledThrice, 'callback fired again after change');
      assert.ok(data.name === 'remy');
    });
  });

  describe('deep object change', function() {
    it('captures deep changes', function () {
      assert.ok(callbacks.city.calledOnce);
      data.location.city = 'London';
      assert.ok(callbacks.city.calledTwice);
    });
  });

  describe('setting arbitrary objects', function () {
    it('allows object to be set as property', function (done) {
       data.location = {'city': 'London'};
       assert.ok(callbacks.city.calledTwice);
       done();
    });
  });

  describe('arrays', function () {
    it('should have called the callback on initialisation', function () {
      assert.ok(callbacks.cats.calledOnce);
    });

    it('should callback on push', function () {
      var length = data.cats.length;

      assert.ok(callbacks.cats.calledOnce);

      data.cats.push({
        'name': 'Jed'
      });

      assert.ok('length correct', data.cats.length === length + 1);
      assert.ok(callbacks.cats.calledTwice);
    });

    it('should callback on individual item change', function () {
      assert.ok(callbacks.dizzy.calledOnce);
      data.cats[0].name = 'Jed';
      assert.ok(callbacks.dizzy.calledTwice);
      assert.ok(data.cats[0].name === 'Jed');
    });
  });

});