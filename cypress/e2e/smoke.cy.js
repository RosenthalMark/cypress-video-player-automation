describe('Global Interface Smoke', () => {
    it('executes a full-page component integrity check', () => {
      cy.visit('/watch?v=NMsfabtgp2o');
  
      const coreComponents = {
        'Navigation Branding/Logo': '#logo',
        'Global Search Bar': 'input#search',
        'User Identity/Profile': '#avatar-btn',
        'Primary Video Title': 'h1.ytd-watch-metadata',
        'Author/Channel Info': '#owner-name',
        'Subscriber Count': '#owner-sub-count',
        'Action Bar (Share/Download)': '#top-level-buttons-computed',
        'Recommendation Engine Rail': '#secondary-inner',
        'Right Rail Chips/Tabs': '#chips-content',
        'Comments Section': '#comments',
        'Comment Sort Menu': '#sort-menu'
      };
  
      // Verify all major UI blocks
      cy.checkLayout(coreComponents);
  
      // Deep check on the Right Rail video items
      cy.get('ytd-compact-video-renderer').should('have.length.at.least', 5)
        .each(($video, index) => {
          // Checking titles and authors in the rail
          cy.wrap($video).find('#video-title').should('not.be.empty');
          cy.wrap($video).find('#byline-text').should('be.visible');
          if(index === 0) cy.log('Right rail data integrity confirmed');
        });
    });
  });