describe('select', () => {
  beforeEach(() => {
    cy.visit('/select').then((win) => cy.wrap({ data: win.data }));
  });

  it('should update DOM as defined by data', () => {
    cy.get('select > option').should('have.length', 3);
  });

  it('should update the data when the DOM is changed', () => {
    cy.get('select')
      .select('Berlin')
      .window()
      .its('data')
      .then((data) => {
        assert.equal(data.me.location.city, 'Berlin');
      });
  });
});
