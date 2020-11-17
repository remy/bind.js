import Bind from '../../lib/bind';
const sinon = Cypress.sinon;

describe('export', () => {
  it('returns vanilla object', () => {
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
    assert.ok(
      JSON.stringify(o) === JSON.stringify(data.__export()),
      'export returns same object'
    );
  });
});
