### Code Organisation
- src/
    - controllers/
        - AppController.js
            - Owns application-level flow
            - Coordinates user events, GameSession actions, and UI updates
    - models/ 
        - GameSession.js
            - Represent one Battleship match
            - Owns match-level state and game flow
            - Exposes match-level actions (setup, turn execution, winner checking and reset)
        - Player.js 
            - Represent a player
            - Owns player-level state
            - Exposes player-level actions (firing at an opponent's board)
        - Gameboard.js
            - Represent a player's gameboard
            - Owns board-level state 
            - Exposes gameboard actions (placing ships, receiving attacks and checking if all ships are sunk)
    - views/ 
        - components/ 
            - Reusable UI components
        - helpers/
            - Shared UI utility functions
        - screens/
            - Screen-level UI modules
        - appShell.js
            - Persistent app layout/shell
        - screenRenderer.js
            - Mounts screens and exposes view update methods
    - styles/
        - Contains screen-level stylesheet
    - assets/
        - Contains application assets 
    - index.js 
        - Application entry point

### Architectural Decisions 
This project uses a modular, MVC-inspired structure with clear responsibility boundaries between game logic, application flow, and UI rendering. 

The `AppController` owns application-level flow. It decides what should happen in response to user actions, such as starting the game, moving between screens, handling attacks, triggering the computer turn, and restarting the game. 

The view layer owns DOM creation and UI updates. Instead of letting `AppController` directly manipulate internal DOM elements, screen modules expose a small public interace for UI updates. 

For example, the `battleScreen.js` exposes methods such as `renderBattleLog()` and `renderGameOver()`, allowing `AppController` to request UI changes without knowing how the battle screen is structured internally. 

This keep the code loosely coupled: 

`AppController`
- decides what should happen

View modules
- decide how the UI should be updated

Model modules
- enforce game rules and manage game state.

This separation makes the code easier to reason about, test, and modify as the project grows.

### Attributions
- Battleship Silhouette Vectors by Vecteezy.com
- Villain character svg from magnific.com
- Background image from StockCake.com
- music and sound effects from Pixabay.comn
