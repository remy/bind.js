describe('parse', function () {
  beforeEach(function () {
    cy.visit('/parse.html').then((win) => cy.wrap({ data: win.data }));
  });

  it('should parse incoming data', () => {
    cy.get('#name')
      .clear()
      .type('Remy Sharp')
      .window()
      .its('data.name')
      .should('equal', 'remy sharp');
  });

  it.only('should support non returning parse function', () => {
    cy.get('#location')
      .clear()
      .type('Worthing')
      .window()
      .its('data.location')
      .should('equal', 'Worthing');
  });
});
