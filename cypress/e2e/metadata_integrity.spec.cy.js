describe('Metadata Integrity', () => {
    it('verifies video title and subscriber counts are synced', () => {
      cy.visit('/watch?v=dQw4w9WgXcQ');
      cy.get('h1.ytd-watch-metadata').should('be.visible').and('not.be.empty');
      cy.get('#owner-sub-count').should('contain', 'subscribers');
    });
  });