import Bind from '../../lib/bind';
const sinon = Cypress.sinon;

describe('edge cases', () => {
  it('should fire callback on object prop when item changes', () => {
    var spy = sinon.spy();
    var data = new Bind(
      {
        cats: ['missy', 'ninja', 'dizzy'],
      },
      {
        'cats.0': spy,
      }
    );

    assert.ok(spy.calledWith('missy'), 'first call: ' + spy.args[0]);
    data.cats.shift();
    assert.ok(spy.calledWith('ninja'), 'shift called callback: ' + spy.args[1]);
  });

  it('should fire callback on object prop when entire object changes', () => {
    var spy = sinon.spy();
    var data = new Bind(
      {
        cats: [
          {
            name: 'missy',
            type: 'black long haired',
          },
          {
            name: 'dizzy',
            type: 'tabby',
          },
          {
            name: 'ninja',
            type: 'black and white',
          },
        ],
      },
      {
        'cats.0.name': spy,
      }
    );

    assert.ok(spy.calledWith('missy'), 'first call');
    data.cats.shift();
    assert.ok(spy.calledWith('dizzy'), 'shift called callback');
  });
});
