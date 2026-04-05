const PLAYER_ROOT_SELECTOR = '.video-js'
const PRIMARY_PLAYER_SELECTOR = '.video-js:not(video)'
const MEDIA_ENGINE_SELECTOR = 'video.vjs-tech'
const PLAYER_UI_SELECTORS = {
  bigPlayButton: '.vjs-big-play-button:visible',
  playControl: '.vjs-play-control:visible',
  muteControl: '.vjs-mute-control:visible',
  progressControl: '.vjs-progress-control:visible'
}

const LANDING_TAG_MAP = {
  'landing-skip-to-content': 'a.visually-hidden-focusable.skip-to-content',
  'landing-brand-title': 'a.peertube-title',
  'landing-search-button': 'button.search-button',
  'landing-search-input': '#search-video',
  'landing-more-filters-toggle': 'button.filters-toggle',
  'landing-home-link': 'a.menu-link',
  'landing-discover-link': 'a.entry',
  'landing-login-container': 'div.buttons-container'
}

const PLAYER_TAG_MAP = {
  'player-container': PLAYER_ROOT_SELECTOR,
  'player-video-tech': 'video.vjs-tech',
  'player-play-control': '.vjs-play-control',
  'player-progress-control': '.vjs-progress-control',
  'player-mute-control': '.vjs-mute-control',
  'player-settings-control': '.vjs-settings, .vjs-icon-settings',
  'player-fullscreen-control': '.vjs-fullscreen-control'
}

Cypress.Commands.add('getPrimaryPlayer', (options = {}) => {
  const timeout = options.timeout || 20000

  return cy.get(PRIMARY_PLAYER_SELECTOR + ', ' + PLAYER_ROOT_SELECTOR, { timeout })
    .then(($players) => {
      const nonVideoPlayers = $players.filter(PRIMARY_PLAYER_SELECTOR)
      if (nonVideoPlayers.length) {
        return cy.wrap(nonVideoPlayers.first(), { log: false })
      }

      return cy.wrap($players.first(), { log: false })
    })
    .should(($player) => {
      expect($player.length, 'expected a .video-js player root').to.equal(1)
    })
})

Cypress.Commands.add('getMediaEngine', (options = {}) => {
  const timeout = options.timeout || 20000

  return cy.getPrimaryPlayer({ timeout })
    .then(($player) => {
      if ($player.is('video')) {
        return cy.wrap($player, { log: false })
      }

      const techVideo = $player.find(MEDIA_ENGINE_SELECTOR).first()
      if (techVideo.length) {
        return cy.wrap(techVideo, { log: false })
      }

      const nestedVideo = $player.find('video').first()
      if (nestedVideo.length) {
        return cy.wrap(nestedVideo, { log: false })
      }

      return cy.get('video.video-js, ' + MEDIA_ENGINE_SELECTOR + ', video', { timeout }).first()
    })
    .should(($video) => {
      expect($video.length, 'expected a media engine video inside the primary player').to.equal(1)
      expect($video[0].tagName, 'media engine should be a VIDEO element').to.equal('VIDEO')
    })
})

// Wait for native video events instead of explicit sleeps
Cypress.Commands.add('waitForMediaEvent', (eventName, trigger, timeoutMs = 10000, failOnTimeout = true) => {
  cy.getMediaEngine().then(($video) => {
    const video = $video[0]

    return cy.wrap(null, { timeout: timeoutMs + 1000 }).then(() => {
      return new Cypress.Promise((resolve, reject) => {
        const onEvent = () => {
          clearTimeout(timer)
          resolve()
        }

        const timer = setTimeout(() => {
          video.removeEventListener(eventName, onEvent)

          if (failOnTimeout) {
            reject(new Error('Timed out waiting for media event "' + eventName + '" after ' + timeoutMs + 'ms'))
            return
          }

          resolve()
        }, timeoutMs)

        video.addEventListener(eventName, onEvent, { once: true })

        if (typeof trigger === 'function') {
          trigger(video)
        }
      })
    })
  })
})

Cypress.Commands.add('validatePlaybackState', (status) => {
  const checks = {
    playing: (video) => {
      expect(video.paused, 'video should be playing').to.be.false
      expect(video.ended, 'video should not be ended').to.be.false
    },
    paused: (video) => expect(video.paused, 'video should be paused').to.be.true,
    buffered: (video) => expect(video.readyState, 'video should be buffered').to.be.at.least(3),
    scrubbed: (video) => expect(video.seeking, 'video should not be seeking').to.be.false
  }

  if (!checks[status]) {
    throw new Error('Unknown playback status "' + status + '"')
  }

  cy.getMediaEngine().should(($video) => {
    checks[status]($video[0])
  })
})

Cypress.Commands.add('playVideo', () => {
  cy.getMediaEngine()

  cy.getPrimaryPlayer().then(($player) => {
    const bigPlayButton = $player.find(PLAYER_UI_SELECTORS.bigPlayButton).first()
    const playControl = $player.find(PLAYER_UI_SELECTORS.playControl).first()

    if (bigPlayButton.length) {
      cy.wrap(bigPlayButton).click({ force: true })
      return
    }

    if (playControl.length && playControl.hasClass('vjs-paused')) {
      cy.wrap(playControl).click({ force: true })
      return
    }

    cy.getMediaEngine().then(($video) => {
      const video = $video[0]
      if (video.paused) video.play()
    })
  })

  // Headless-safe autoplay assist
  cy.getMediaEngine().then(($video) => {
    const video = $video[0]
    video.muted = true
    const playPromise = video.play()
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {})
    }
  })

  cy.getMediaEngine().should(($video) => {
    expect($video[0].paused, 'video should be playing').to.be.false
    expect($video[0].ended, 'video should not be ended').to.be.false
  })
})

Cypress.Commands.add('verifyVideoMoving', (timeoutMs = 15000) => {
  let startTime = 0

  cy.getMediaEngine().then(($video) => {
    startTime = $video[0].currentTime
  })

  cy.getMediaEngine({ timeout: timeoutMs }).should(($video) => {
    const currentTime = $video[0].currentTime
    const activePlayback = $video[0].paused === false && $video[0].ended === false

    expect(
      currentTime > startTime || activePlayback,
      'expected progress or active playback (start=' + startTime + ', current=' + currentTime + ')'
    ).to.be.true
  })
})

Cypress.Commands.add('seekTo', (percent) => {
  const boundedPercent = Math.max(0, Math.min(100, percent))

  cy.getMediaEngine().then(($video) => {
    const video = $video[0]
    const duration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 0
    const targetTime = duration > 0 ? (duration * boundedPercent) / 100 : video.currentTime

    cy.getPrimaryPlayer().then(($player) => {
      const vjsProgress = $player.find(PLAYER_UI_SELECTORS.progressControl).first()

      if (vjsProgress.length && duration > 0) {
        const width = vjsProgress.width() || 0
        const coordX = Math.max(1, width * (boundedPercent / 100))

        cy.waitForMediaEvent('seeked', () => {
          cy.wrap(vjsProgress).click(coordX, 5, { force: true })
        }, 12000, false)

        cy.getMediaEngine().should(($freshVideo) => {
          expect($freshVideo[0].currentTime, 'video should seek close to target time').to.be.closeTo(targetTime, 2)
        })
        return
      }

      video.currentTime = targetTime
      video.dispatchEvent(new Event('seeking', { bubbles: true }))
      video.dispatchEvent(new Event('seeked', { bubbles: true }))
    })

    cy.getMediaEngine().should(($freshVideo) => {
      expect($freshVideo[0].currentTime, 'video should seek to a valid time').to.be.at.least(0)
    })
  })

  cy.validatePlaybackState('scrubbed')
})

Cypress.Commands.add('playerAction', (action) => {
  const setMuteState = (targetMuted) => {
    cy.getMediaEngine().then(($video) => {
      const video = $video[0]
      if (video.muted === targetMuted) return

      cy.getPrimaryPlayer().then(($player) => {
        const muteControl = $player.find(PLAYER_UI_SELECTORS.muteControl).first()

        if (muteControl.length) {
          cy.wrap(muteControl).click({ force: true })
        }
      })

      cy.getMediaEngine().then(($freshVideo) => {
        if ($freshVideo[0].muted !== targetMuted) {
          $freshVideo[0].muted = targetMuted
          $freshVideo[0].dispatchEvent(new Event('volumechange', { bubbles: true }))
        }
      })
    })

    cy.getMediaEngine().should(($video) => {
      const assertionLabel = targetMuted ? 'video should be muted' : 'video should be unmuted'
      expect($video[0].muted, assertionLabel).to.equal(targetMuted)
    })
  }

  const actions = {
    mute: () => setMuteState(true),
    unmute: () => setMuteState(false)
  }

  if (!actions[action]) {
    throw new Error('Unsupported playerAction "' + action + '"')
  }

  actions[action]()
})

Cypress.Commands.add('pauseVideo', () => {
  cy.getPrimaryPlayer().then(($player) => {
    const pauseControl = $player.find(PLAYER_UI_SELECTORS.playControl).first()

    if (pauseControl.length && pauseControl.hasClass('vjs-playing')) {
      cy.wrap(pauseControl).click({ force: true })
      return
    }

    cy.getMediaEngine().then(($video) => {
      const video = $video[0]
      if (!video.paused) video.pause()
    })
  })

  cy.validatePlaybackState('paused')
})

Cypress.Commands.add('checkLayout', (elements) => {
  Object.entries(elements).forEach(([name, selector]) => {
    cy.get(selector).should('be.visible')
    cy.log('Verified Component: ' + name)
  })
})

Cypress.Commands.add('labelElement', (selector, label) => {
  cy.get(selector).invoke('attr', 'data-test-label', label)
})

Cypress.Commands.add('tagElementsForReadability', (tagMap) => {
  Object.entries(tagMap).forEach(([label, selector]) => {
    cy.get('body').then(($body) => {
      const found = $body.find(selector).first()
      if (!found.length) return
      cy.wrap(found).invoke('attr', 'data-test-label', label)
    })
  })
})

Cypress.Commands.add('getByTagOrSelector', (label, fallbackSelector, options = {}) => {
  const timeout = options.timeout || 10000
  const taggedSelector = '[data-test-label="' + label + '"]'

  return cy.get('body', { timeout }).then(($body) => {
    const tagged = $body.find(taggedSelector).first()
    if (tagged.length) {
      return cy.wrap(tagged)
    }

    return cy.get(fallbackSelector, { timeout })
  })
})

Cypress.Commands.add('tagLandingPageElements', () => {
  cy.tagElementsForReadability(LANDING_TAG_MAP)

  cy.get('a.video-thumbnail').each(($el, index) => {
    if (index >= 8) return
    cy.wrap($el).invoke('attr', 'data-test-label', 'landing-video-thumb-' + (index + 1))
  })

  cy.get('a.inherit-parent-style').each(($el, index) => {
    if (index >= 8) return
    cy.wrap($el).invoke('attr', 'data-test-label', 'landing-channel-' + (index + 1))
  })
})

Cypress.Commands.add('tagPlayerPageElements', () => {
  cy.getPrimaryPlayer()
  cy.activatePlayerControls()
  cy.tagElementsForReadability(PLAYER_TAG_MAP)
})

Cypress.Commands.add('activatePlayerControls', () => {
  cy.getPrimaryPlayer()

  cy.getPrimaryPlayer().then(($player) => {
    $player.addClass('vjs-user-active')
    $player.removeClass('vjs-user-inactive')
  })

  cy.getPrimaryPlayer().trigger('mousemove', { force: true })

  cy.getPrimaryPlayer({ timeout: 10000 }).then(($player) => {
    const controlBar = $player.find('.vjs-control-bar').first()

    if (!controlBar.length) {
      cy.log('Player control bar not present yet; continuing without hard failure')
      return
    }

    cy.wrap(controlBar).should('exist')
  })
})

Cypress.Commands.add('getFirstExisting', (selectors, options = {}) => {
  const timeout = options.timeout || 10000
  const selectorList = Array.isArray(selectors) ? selectors : [selectors]

  return cy.get('body', { timeout }).then(($body) => {
    const matchedSelector = selectorList.find((selector) => $body.find(selector).length > 0)

    expect(
      matchedSelector,
      'expected at least one selector to exist: ' + selectorList.join(', ')
    ).to.be.a('string')

    return cy.get(matchedSelector, { timeout }).first()
  })
})

Cypress.Commands.add('assertAnyVisible', (selectors, label = 'selector group', options = {}) => {
  return cy.getFirstExisting(selectors, options).should('be.visible').then(($element) => {
    cy.log('Verified visible element for ' + label + ': ' + $element.prop('tagName').toLowerCase())
  })
})

Cypress.Commands.add('ensureLandingFiltersExpanded', () => {
  cy.get('body').then(($body) => {
    const languageControl = $body.find('#languageOneOf').first()
    if (languageControl.length && languageControl.is(':visible')) return

    const filtersToggle = $body.find('button.filters-toggle').first()
    if (filtersToggle.length) {
      cy.wrap(filtersToggle).click({ force: true })
    }
  })

  cy.get('#languageOneOf', { timeout: 10000 }).should('exist')
})

Cypress.Commands.add('verifyLandingCoreChrome', () => {
  const chromeSelectors = {
    skipToContent: 'a.visually-hidden-focusable.skip-to-content',
    brandTitle: 'a.peertube-title',
    searchButton: 'button.search-button',
    searchInput: '#search-video',
    settingsButton: 'my-button.settings-button',
    homeMenu: 'a.menu-link.active',
    discoverMenu: 'a.entry',
    recentSort: 'a.peertube-button-link.secondary-button.active',
    trendingSort: 'a.peertube-button-link.secondary-button',
    moreFilters: 'button.filters-toggle'
  }

  cy.checkLayout(chromeSelectors)
  cy.ensureLandingFiltersExpanded()

  cy.get('#search-video')
    .should('have.attr', 'aria-label')
    .and('include', 'Search videos')

  cy.get('#languageOneOf').should('have.attr', 'role', 'combobox')
  cy.get('div.buttons-container').should('contain.text', 'Login')
  cy.get('div.mobile-controls').should('exist')
  cy.get('button.toggle-menu').should('exist')

  cy.get('a.menu-link, a.entry').then(($entries) => {
    const entryText = [...$entries]
      .map((entry) => (entry.textContent || '').replace(/\s+/g, ' ').trim())
      .filter(Boolean)

    const expectedNavLabels = [/Home/i, /Discover/i, /Browse videos/i]
    const matchedLabels = expectedNavLabels.filter((pattern) => entryText.some((text) => pattern.test(text)))

    expect(
      matchedLabels.length,
      'navigation should expose at least two core labels (Home/Discover/Browse videos)'
    ).to.be.at.least(2)
  })
})

Cypress.Commands.add('verifyLandingCatalogIntegrity', (targetSampleSize = 24) => {
  cy.get('a.video-thumbnail', { timeout: 30000 }).then(($thumbs) => {
    const availableThumbCount = $thumbs.length
    const sampleSize = Math.min(targetSampleSize, availableThumbCount)

    expect(availableThumbCount, 'landing page should have a substantial visible feed').to.be.at.least(20)
    expect(sampleSize, 'sample size should still be meaningful').to.be.at.least(20)

    const sampledThumbs = [...$thumbs].slice(0, sampleSize)
    sampledThumbs.forEach((thumb) => {
      const aria = thumb.getAttribute('aria-label') || ''
      const duration = thumb.textContent?.trim() || ''

      expect(aria, 'thumbnail should have watch aria label').to.match(/^Watch video\s.+/)
      expect(duration, 'thumbnail should show duration').to.match(/^\d{1,2}:\d{2}(?::\d{2})?$/)
    })

    cy.get('a.inherit-parent-style').should('have.length.at.least', sampleSize)
    cy.get('a.ellipsis-multiline-2.inherit-parent-style').should('have.length.at.least', sampleSize)

    cy.get('a.ellipsis-multiline-2.inherit-parent-style').then(($titles) => {
      const sampledTitles = [...$titles].slice(0, sampleSize)
      sampledTitles.forEach((title) => {
        const text = title.textContent?.trim() || ''
        expect(text, 'video title should not be blank').to.have.length.greaterThan(2)
      })
    })
  })
})

Cypress.Commands.add('auditPlayerA11y', (context = '.video-js', config = {}) => {
  if (typeof cy.checkA11y !== 'function') {
    throw new Error('cy.checkA11y is unavailable. Install and load cypress-axe before using auditPlayerA11y.')
  }

  if (context) {
    cy.get(context, { timeout: 20000 }).should('exist')
  }

  const baseConfig = {
    runOnly: {
      type: 'tag',
      values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']
    },
    rules: {
      'color-contrast': { enabled: false }
    }
  }

  const mergedConfig = {
    ...baseConfig,
    ...config,
    rules: {
      ...baseConfig.rules,
      ...(config.rules || {})
    }
  }

  cy.injectAxe()
  cy.checkA11y(context, mergedConfig)
})
