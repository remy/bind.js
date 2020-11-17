const sinon = Cypress.sinon;

describe('checkboxes', function () {
  var spy;

  beforeEach(function () {
    spy = sinon.spy();
    cy.visit('/checkboxes.html', {
      onBeforeLoad: (win) => {
        spy = sinon.spy();
        win.spy = spy;
      },
    }).then((win) => {
      cy.wrap({ data: win.data });
    });
  });

  it('should have checked boxes', () => {
    cy.get('input:checked').should((t) => {
      expect(t).have.length(2);
    });
  });

  it('should have called spy', () => {
    assert.ok(spy.called, 'spy called ' + spy.callCount);
  });

  it('should be accessible in cy', () => {
    cy.window()
      .its('data')
      .should((data) => {
        assert.deepEqual(
          data.__export(),
          { ts: ['one', 'two'] },
          JSON.stringify(data.__export())
        );
      });
  });

  it('should update the data when the DOM is changed', () => {
    cy.get('input[value="three"]')
      .click()
      .window()
      .its('data')
      .should((data) => {
        assert.deepEqual(
          data.__export(),
          { ts: ['one', 'two', 'three'] },
          JSON.stringify(data.__export())
        );
      });
  });
});
