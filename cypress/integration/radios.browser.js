const sinon = Cypress.sinon;

describe('radios', function () {
  var data;
  var spy;

  beforeEach(function () {
    spy = sinon.spy();
    cy.visit('/radios.html', {
      onBeforeLoad: (win) => {
        spy = sinon.spy();
        win.spy = spy;
      },
    }).then((win) => cy.wrap({ data: win.data }));
  });

  it('should update DOM as defined by data', () => {
    cy.get('input:checked').should('have.length', 1).and('have.value', 'one');
    assert.ok(spy.called, 'spy called ' + spy.callCount);
  });

  it('should update the data when the DOM is changed', () => {
    cy.get('input[value="three"]')
      .check()
      .window()
      .its('data.ts')
      .should('equal', 'three');
  });
});
