// Advanced Media Engine Discovery
Cypress.Commands.add('getMediaEngine', () => {
  return cy.get('video.video-stream', { timeout: 10000 }).should('exist');
});

// State Machine for Video Validation - Checking properties, not just visibility
Cypress.Commands.add('validatePlaybackState', (status) => {
  cy.getMediaEngine().then(($video) => {
    const video = $video[0];
    const check = {
      playing: () => {
        expect(video.paused).to.be.false;
        expect(video.currentTime).to.be.greaterThan(0);
      },
      paused: () => expect(video.paused).to.be.true,
      buffered: () => expect(video.readyState).to.be.at.least(3),
      scrubbed: () => expect(video.seeking).to.be.false
    };
    check[status]();
  });
});

// Coordinate-based scrubbing logic
Cypress.Commands.add('seekTo', (percent) => {
  cy.get('.ytp-progress-bar').then(($bar) => {
    const width = $bar.width();
    const coordX = width * (percent / 100);
    cy.wrap($bar).click(coordX, 5, { force: true });
  });
});

// High-speed Interface Integrity Loop
Cypress.Commands.add('checkLayout', (elements) => {
  Object.entries(elements).forEach(([name, selector]) => {
    cy.get(selector).should('be.visible');
    cy.log(`Verified Component: ${name}`);
  });
});

// DOM Mutation for Testability
Cypress.Commands.add('labelElement', (selector, label) => {
  cy.get(selector).invoke('attr', 'data-test-label', label);
});