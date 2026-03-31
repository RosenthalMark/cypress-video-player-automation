describe('UX Behavior and Layout Persistence', () => {
    beforeEach(() => {
      cy.visit('/watch?v=NMsfabtgp2o');
    });
  
    it('validates theater mode expansion and viewport shift', () => {
      cy.get('.ytp-size-button').click();
      // Validating the internal player class change
      cy.get('#movie_player').should('have.class', 'ytp-large-width-mode');
    });
  
    it('verifies audio state persistence across page lifecycle', () => {
      cy.get('.ytp-mute-button').click();
      cy.getMediaEngine().should('have.prop', 'muted', true);
      
      // Staff move: Ensure property persists after a reload
      cy.reload();
      cy.getMediaEngine().should('have.prop', 'muted', true);
    });
  });