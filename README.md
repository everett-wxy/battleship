# Battleship

A browser-based Battleship game built with vanilla JavaScript, HTML, CSS, and Webpack. The project uses no frontend framework and focuses on modular game logic, DOM-driven UI rendering, drag-and-drop fleet placement, turn-based battle flow, audio feedback, and unit-tested core models.

Repository: [everett-wxy/battleship](https://github.com/everett-wxy/battleship)

Live Demo: [View deplayed app](https://comeplaybattleship.netlify.app/)

## Features

- Player name entry with validation.
- Rules dialog available from the persistent top-right control panel.
- Drag-and-drop fleet placement on a 10x10 board.
- Horizontal/vertical ship orientation controls.
- Reset and confirm controls for fleet setup.
- Computer fleet placement.
- Turn-based battle flow against a computer opponent.
- Hit, miss, sunk ship, and game-over feedback.
- Animated attack markers, prompts, dialogue panels, and HUD-style buttons.
- Background music, sound effects, mute control, and automatic music pause when the browser tab is hidden.
- Restart flow after the battle is complete.
- Unit tests for the core game models.

## How To Play

1. Enter your admiral name.
2. Read the mission rules and begin fleet placement.
3. Drag every ship onto your grid.
4. Use the orientation button to switch between horizontal and vertical placement.
5. Confirm your fleet when all ships are placed.
6. Fire on the enemy grid and alternate turns with the computer.
7. Sink all enemy ships before your fleet is destroyed.

## Controls

- `Music on/off`: toggles background music.
- `Rules`: opens the rules dialog.
- `Github`: opens the project repository.
- `Change Orientation`: switches ship placement direction.
- `Reset`: clears your fleet placement.
- `Confirm`: starts the battle after all ships are placed.
- `Restart`: returns to the start screen after game over.

## Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm start
```

Build the project:

```bash
npm run build
```

Run tests:

```bash
npm test
```

Run linting:

```bash
npm run lint
```

## Tech Stack

- JavaScript modules
- HTML and CSS
- Webpack
- Jest
- ESLint

## Code Organisation

```text
src/
  controllers/
    AppController.js
    AudioController.js
  models/
    GameSession.js
    Gameboard.js
    Player.js
    Ship.js
  views/
    appShell.js
    screenRenderer.js
    components/
    helpers/
    screens/
  styles/
  assets/
  index.js
```

## Architecture

This project uses a modular, MVC-inspired structure with clear responsibility boundaries between game logic, application flow, and UI rendering.

`AppController` owns the application flow. It starts the game, opens the rules dialog, moves into fleet placement, starts battle mode, handles player attacks, runs computer turns, updates feedback, and restarts the game.

The model layer owns the game rules:

- `GameSession.js` represents one match and coordinates turns, players, fleet placement, and winner checks.
- `Gameboard.js` owns board state, ship placement validation, attacks, and sunk-fleet checks.
- `Player.js` represents human and computer players.
- `Ship.js` tracks ship health and sunk status.

The view layer owns DOM creation and UI updates. Screen modules expose a small public interface so the controller can request updates without knowing each screen's internal DOM structure.

For example, `battleScreen.js` exposes methods such as `renderGameOver()`, `renderEnemyMarker()`, and `setPrompt()`. `AppController` decides what should happen, while the battle screen decides how that change appears.

This separation keeps the code easier to test, debug, and extend.

## Testing

The project uses Jest to test the core game models, including ship behaviour, board placement rules, attack handling, repeated attacks, computer attack selection logic, sunk-ship detection, and game-over conditions.

## Attributions

- Character designs generated with ChatGPT.
- Character references from Magnific.
- Battleship silhouette vectors by Vecteezy.
- Background image from StockCake.
- Music and sound effects from Pixabay.
- Button hover/click sound from Tunetank.
- Character and UI assets are stored in `src/assets/`.
