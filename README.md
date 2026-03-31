# Cypress Video Player Automation: High-Scale Media Testing

A production-grade Cypress framework architected to validate HTML5 and HLS video playback logic. This suite demonstrates how to move beyond simple UI clicking and into state-driven media validation for complex web environments like YouTube.

## The Engineering Challenge
Testing video players requires more than "seeing" a play button. It requires intercepting the browser's media engine to ensure the UX remains stable under varying network conditions. This framework hooks directly into the `HTMLMediaElement` API to verify state transitions that traditional UI tests often miss.

## Key Architectural Features
* **State-Driven Assertions:** Monitoring `readyState`, `paused`, and `currentTime` via the `window` object.
* **Buffer Logic Validation:** Asserting on buffering events to ensure playback continuity during high-latency scenarios.
* **Custom Command Layer:** A clean abstraction for player controls (play, pause, seek, mute) to keep test scripts readable and maintainable.
* **Intercepted Event Listeners:** Verifying that media events (play, playing, waiting, ended) are firing in the correct sequence.

## Tech Stack
* **Framework:** Cypress
* **Language:** JavaScript / Node.js
* **Target:** HTML5 / HLS Video Players
* **Architecture:** Page Object Model (POM) with Custom Command Abstraction

## Quick Start
1. **Clone the repo:** `git clone https://github.com/RosenthalMark/cypress-video-player-automation.git`
2. **Install dependencies:** `npm install`
3. **Open Cypress:** `npx cypress open`
4. **Headless Execution:** `npm run cypress:run`

## Why This Matters
In a high-scale streaming environment, a "passed" UI test doesn't guarantee a "playing" video. This framework ensures that the underlying media stream is healthy, the controls are responsive, and the player recovers gracefully from network interruptions.

---
**Architected by Mark Rosenthal**
Staff Quality Automation Engineer
[markrosenthal.site](https://markrosenthal.site)
