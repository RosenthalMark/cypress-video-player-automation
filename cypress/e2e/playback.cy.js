describe('Media Playback Engine', () => {
    beforeEach(() => {
      cy.visit('/watch?v=NMsfabtgp2o');
    });
  
    it('validates interactive seeking and state synchronization', () => {
      // Start and verify initial play state
      cy.getMediaEngine().click({ force: true });
      cy.validatePlaybackState('playing');
  
      // Scrub to 75% via coordinate calculation
      cy.seekTo(75);
      
      // Verify internal seeking state and timestamp movement
      cy.get('.ytp-time-current').then(($time) => {
        const timeAtScrub = $time.text();
        cy.wait(1500);
        cy.get('.ytp-time-current').invoke('text').should('not.equal', timeAtScrub);
      });
  
      cy.validatePlaybackState('playing');
    });
  });