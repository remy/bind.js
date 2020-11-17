describe('DOM values informing bind', function () {
  beforeEach(() => {
    cy.visit('/dom-values.html').then((win) => cy.wrap({ data: win.data }));
  });

  it('should find selectors', () => {
    cy.get('.score').should('have.length', 2);
  });

  it('should update bind values based on DOM', () => {
    cy.window()
      .its('data')
      .should((data) => {
        assert.equal(data.score, '10', 'bind value is correct: ' + data.score);
        assert.ok(data.price === 100, 'price is right: ' + data.price);
      });
  });
});
