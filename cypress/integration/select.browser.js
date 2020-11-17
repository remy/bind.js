const sinon = Cypress.sinon;

describe.skip('select', () => {
  var data;
  var spy;

  beforeEach(() => {
    spy = sinon.spy();
    cy.visit('/select.html', {
      onBeforeLoad: (win) => {
        spy = sinon.spy();
        win.spy = spy;
      },
    }).then((win) => cy.wrap({ data: win.data }));
  });

  it('should update DOM as defined by data', () => {
    cy.get('select').should('have.length', 1).and('have.value', 'one');
    assert.ok(spy.called, 'spy called ' + spy.callCount);
  });

  it('should update the data when the DOM is changed', () => {
    var node = document.querySelector('select');

    node.value = 'three';
    var event = document.createEvent('HTMLEvents');
    event.initEvent('change', true, true);
    node.dispatchEvent(event);

    setTimeout(() => {
      assert.equal(data.ts, 'three', 'ts: ' + data.ts);
      done();
    }, 10);
  });
});
