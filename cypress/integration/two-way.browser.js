describe('transform with bind', () => {
  beforeEach(() => {
    cy.visit('/two-way.html').then((win) => cy.wrap({ data: win.data }));
  });

  it('should find selectors', () => {
    cy.get('.score').should('have.length', 3);
  });

  it('should update DOM to data values', () => {
    const target = 10;
    let found = 0;
    cy.window()
      .its('data')
      .then((data) => {
        data.score = target;
      })
      .get('.score')
      .each(([el]) => {
        let value = null;

        if (el.nodeName === 'SPAN') {
          value = parseInt(el.innerHTML, 10);
        } else {
          value = parseInt(el.value, 10);
        }

        if (value === target) {
          found++;
        }
      })
      .then(() => {
        assert.equal(found, 3);
      });
  });

  it('should update textarea elements', () => {
    let data;
    cy.window()
      .its('data')
      .then((d) => (data = d))
      .get('textarea')
      .should((textarea) => expect(textarea).to.have.value(data.body));
  });

  it('should update data based on element changes', () => {
    let data;
    cy.window()
      .its('data')
      .then((d) => (data = d))
      .get('input.score')
      .invoke('val', 20)
      .trigger('input')
      .then(() => {
        assert.equal(
          data.score,
          20,
          'found ' + data.score + ' - ' + typeof data.score
        );
      });
  });

  it('should support text fields', () => {
    let data;
    cy.window()
      .its('data')
      .then((d) => (data = d))
      .get('input.name')
      .should((node) => {
        expect(node).to.have.value(data.name);
      })
      .clear()
      .type('remy')
      .then(() => {
        assert.equal(data.name, 'remy');
      });
  });
});
