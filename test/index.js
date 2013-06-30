var bind = require('../../bind');
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

    data = bind({
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

  describe('callbacks fire on arrays', function () {
    it('array.push', function () {
      var length = data.cats.length;

      data.cats.push({
        'name': 'Jed'
      });

      assert.ok(data.cats.length === length + 1);
      assert.ok(callbacks.cats.calledTwice);
    });

    it('array item is changed', function () {
      console.log(cats['0'].name);
      assert.ok(cats['0'].name.calledOnce);
      data.cats[0].name = 'Jed';
      assert.ok(cats['0'].name.calledTwice);
    });
  });

});