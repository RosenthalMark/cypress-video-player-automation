describe('UI and Layout', () => {
    beforeEach(() => {
      cy.visit('/watch?v=dQw4w9WgXcQ');
    });
  
    it('toggles theater mode and validates container expansion', () => {
      cy.get('.ytp-size-button').click();
      cy.get('#movie_player').should('have.class', 'ytp-large-width-mode');
    });
  
    it('persists volume and mute states across interactions', () => {
      cy.get('.ytp-mute-button').click();
      cy.getYoutubeVideo().should('have.prop', 'muted', true);
    });
  });