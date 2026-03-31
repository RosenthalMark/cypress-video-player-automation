describe('Network and API Resilience', () => {
  it('stubs 500 error on recommendations to verify graceful degradation', () => {
    // Intercepting the 'Next' service which populates the sidebar
    cy.intercept('POST', '**/youtubei/v1/next*', {
      statusCode: 500,
      body: { error: 'Internal Server Error' }
    }).as('apiFail');

    // Swap 'YOUR_VIDEO_ID' with your actual channel video ID
    cy.visit('/watch?v=YOUR_VIDEO_ID');
    
    // Staff-level: We wait for the failure to be caught
    cy.wait('@apiFail', { timeout: 15000 });
    
    // Assertion 1: Ensure the player itself didn't crash because of the sidebar failure
    cy.getYoutubeVideo().should('be.visible');
    
    // Assertion 2: Check that the UI handled the 500 gracefully 
    // (YouTube usually shows a skeleton or an empty secondary column)
    cy.get('#secondary-inner').should('exist');
    
    // Assertion 3: Verify the "Engine" is still functional despite the API error
    cy.assertVideoState('buffered');
  });
});