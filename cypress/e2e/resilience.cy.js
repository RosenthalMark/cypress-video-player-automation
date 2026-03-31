describe('Infrastructure Resilience', () => {
    it('intercepts and injects custom data layer into the production API', () => {
      cy.intercept('POST', '**/youtubei/v1/next*', (req) => {
        req.continue((res) => {
          if (res.body.contents) {
            // Navigating the complex YouTube JSON tree to inject our own data
            const titlePath = res.body.contents.twoColumnWatchNextResults.results.results.contents[0].videoPrimaryInfoRenderer.title.runs[0];
            titlePath.text = "PROTOTYPE DATA INJECTION ACTIVE";
          }
          res.send(res.body);
        });
      }).as('dataInjection');
  
      cy.visit('/watch?v=NMsfabtgp2o');
      cy.wait('@dataInjection');
      
      // Proves frontend handles mutated data from the API
      cy.contains('PROTOTYPE DATA INJECTION ACTIVE').should('be.visible');
      cy.validatePlaybackState('buffered');
    });
  });