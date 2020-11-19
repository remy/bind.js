describe('checkboxes', function () {
  beforeEach(function () {
    cy.visit('/checkbox.html').then((win) => {
      cy.wrap({ data: win.data });
    });
  });

  it('should have checked boxes', () => {
    cy.get('input:checked').should((t) => {
      expect(t).have.length(1);
    });
  });

  it.only('should check the box when data changes', () => {
    let data;
    cy.window()
      .its('data')
      .then((d) => {
        data = d;
        data.one = true;
      })
      .get('input:checked')
      .should((t) => {
        expect(t).have.length(2);
      });
  });
});
