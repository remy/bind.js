import Bind from '../../lib/bind';
const sinon = Cypress.sinon;

describe('transform with bind', () => {
  beforeEach(() => {
    cy.visit('/transform.html').then((win) => cy.wrap({ data: win.data }));
  });

  it('should update DOM as defined by transform', () => {
    cy.get('#cats li').should('have.length', 3);
  });

  it('should update the DOM when values change', () => {
    cy.window()
      .its('data')
      .should((data) => {
        data.cats.push({ name: 'nap', type: 'black & white' });
      })
      .get('#cats li')
      .should('have.length', 4);
  });

  it('should support parse before object updates', () => {
    var parse = sinon.spy(() => 'XXX');
    var transform = sinon.spy(() => 'sam');

    let data;
    cy.window()
      .should((win) => {
        data = Bind(
          {
            name: 'nap',
          },
          {
            name: {
              dom: '#name',
              parse,
              transform,
            },
          },
          win.document
        );
        data.name = 'foo';
      })
      .then(() => {
        assert.equal(
          transform.callCount,
          2,
          `transform called ${transform.callCount} times`
        );
        assert.equal(parse.callCount, 0);
      })
      .get('#name')
      .should('have.value', 'sam')
      .get('#name')
      .clear()
      .type('bar')
      .then(() => {
        assert.ok(parse.callCount > 0);
        assert.ok(data.name === 'XXX');
      });
  });

  it('should support text fields', () => {
    let data = null;
    cy.window()
      .then((win) => {
        data = Bind(
          {
            name: 'julie',
          },
          {
            name: {
              dom: '#name',
              transform: function (value) {
                return this.safe(value);
              },
            },
          },
          win.document
        );
      })
      .get('#name')
      .should(($name) => {
        expect($name).to.have.value(data.name);
      })
      .clear()
      .type('remy')
      .then(() => {
        assert.equal(data.name, 'remy');
      });
  });
});
