Battleship Silhouette Vectors by Vecteezy.com
Background image from StockCake.com
music from Pixabay.comn


AppController.js
- starts game
- moves from rules → fleet setup → battle
- passes callbacks around

screenRenderer.js
- owns #root / #app
- replaces current screen with new screen

screens/fleetSetupScreen.js
- builds the full fleet setup screen

screens/battleScreen.js
- builds the full battle screen

components/gameboardComponent.js
- builds reusable gameboard UI

models/Game.js
- stores game state and rules