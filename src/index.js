import "./styles/global.css";
import "./styles/ships.css";
import "./styles/pregame.css";
import { initialise } from "./controllers/AppController.js";
import { enableBackgroundMusic } from "./controllers/AudioController.js";

enableBackgroundMusic();
initialise();
