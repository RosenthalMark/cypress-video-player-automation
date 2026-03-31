describe('Playback Engine', () => {
    beforeEach(() => {
      cy.visit('/watch?v=dQw4w9WgXcQ');
    });
  
    it('validates media readyState and playback start', () => {
      cy.getYoutubeVideo().click({ force: true });
      cy.assertVideoState('playing');
    });
  
    it('verifies the buffer is populated for future data', () => {
      cy.assertVideoState('buffered');
    });
  });