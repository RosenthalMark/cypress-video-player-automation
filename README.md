# cypress-video-player-automation
Staff-level Cypress framework architected for testing HTML5 and HLS video player events, buffer states, and playback reliability on YouTube.


# Cypress Video Player Automation

A production-grade Cypress framework designed to validate HTML5 and HLS video playback logic. This suite demonstrates how to test state-driven media components, event listeners, and buffer handling in complex web environments.

## Features
* **Custom Commands:** Abstracted player controls (play, pause, seek, mute).
* **Event Interception:** Monitoring player state transitions via `window` objects.
* **Buffer Validation:** Assertions for playback continuity and buffering states.
* **Dynamic Handling:** Cross-browser support for YouTube playback scenarios.

## Quick Start
1. Install dependencies: `npm install`
2. Open Cypress: `npx cypress open`
3. Execute tests: `npx cypress run`

## Why this approach?
Instead of simple element interaction, this framework hooks into the underlying `HTMLMediaElement` API. This allows for assertions on `currentTime`, `paused` states, and `readyState` to ensure the UX is seamless under varying network conditions.

---
Built by Mark Rosenthal.
