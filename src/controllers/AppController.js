import {
    createAppShell,
    renderStartScreen,
    renderBattleScreen,
    renderRulesDialogScreen,
    renderPlaceFleetScreen,
} from "../views/screenRenderer.js";

import { Game } from "../models/GameSession.js";
import { playCannonFireSound, playExplosionSound, playMissedSound } from "./AudioController.js";
import { MarsStroke } from "lucide";

export function initialise() {
    createAppShell();
    // renderStartScreen(handleGameStart);

    // generalte random placement
    const currentGame = new Game("everett");
    // set up fleet
    Game.fleet.forEach((ship, i) => {
        currentGame.humanPlayer.gameboard.placeShip(ship.name, ship.length, i + 1, i, "horizontal");
    });
    currentGame.placeComputerFleet();

    startBattle(currentGame);
}

function handleGameStart(playerName) {
    const currentGame = new Game(playerName);
    showRules(currentGame);
}

function showRules(currentGame) {
    renderRulesDialogScreen(currentGame, () => {
        showFleetSetup(currentGame);
    });
}

function showFleetSetup(currentGame) {
    renderPlaceFleetScreen(currentGame, () => {
        startBattle(currentGame);
    });
    currentGame.placeComputerFleet();
}

function startBattle(currentGame) {
    let isWaitingForComputer = false;

    const battleView = renderBattleScreen(currentGame, {
        onHumanFire: handleHumanFire,
        onRestart: restartGame,
    });

    async function handleHumanFire(row, col) {
        if (currentGame.isGameOver || isWaitingForComputer) {
            return;
        }

        try {
            const turnRes = currentGame.runTurn(row, col);

            isWaitingForComputer = true;

            await handleTurnFeedback(turnRes, battleView, "enemy");

            if (turnRes.atkRes.isSunk) {
                const sunkShipPlacement = getShipPlacement(currentGame.computerPlayer.gameboard, turnRes.atkRes.ship);

                battleView.renderEnemyShip(sunkShipPlacement);
            }

            if (currentGame.isGameOver) {
                battleView.renderGameOver(currentGame.winner);
                return;
            }

            await delay(1500);

            const computerTurnRes = currentGame.runTurn();

            await handleTurnFeedback(computerTurnRes, battleView, "friendly");

            if (currentGame.isGameOver) {
                battleView.renderGameOver(currentGame.winner);
                return;
            }
        } catch (e) {
            console.log(e.message);
            console.log(e.stack);
        } finally {
            isWaitingForComputer = false;
        }
    }
}

function restartGame() {
    renderStartScreen(handleGameStart);
}

function getShipPlacement(gameboard, ship) {
    return gameboard.placedShips.find((shipPlacement) => {
        return shipPlacement.ship === ship;
    });
}

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function generateDialogueMessage(atkRes, attacker) {
    const dialogues = {
        friendly: {
            hit: [
                "Direct hit, Commander! Enemy hull integrity compromised!",
                "Good strike, Commander! We've punched through their defenses!",
                "Confirmed hit! Enemy vessel is taking damage!",
                "Impact confirmed, Commander! Their fleet is under pressure!",
                "Excellent shot, Commander! Enemy ship has sustained damage!",
                "Target struck! Enemy crew is scrambling to respond!",
                "Hit confirmed! Their position is weakening!",
                "Clean impact, Commander! Keep the pressure on!",
                "Enemy ship hit! Awaiting your next firing command!",
                "That one landed, Commander! Enemy vessel is damaged!",
                "Strike successful! Their fleet won't hold for long!",
                "Confirmed impact! Enemy armor has been breached!",
                "Great shot, Commander! We have them on the back foot!",
                "Shell impact confirmed! Enemy vessel is reeling!",
                "Direct strike! Their formation is starting to break!",
            ],
            miss: [
                "Shot missed, Commander. Enemy vessel remains untouched.",
                "Miss confirmed. Adjusting targeting data now.",
                "No impact, Commander. The round landed wide.",
                "Splash confirmed. Target remains operational.",
                "Missed strike, Commander. Recommend recalibrating aim.",
                "Round fell short. Enemy ship is still in fighting condition.",
                "No hit registered. Awaiting your next command.",
                "Negative impact, Commander. Enemy fleet is still holding position.",
                "Shot went wide. We'll correct the firing solution.",
                "Miss confirmed. The enemy got lucky this time.",
                "No damage dealt. Ready for your next order, Commander.",
                "Splash only, Commander. Target still active.",
                "The shot missed. Recalculating trajectory.",
                "No contact. Enemy vessel evaded the strike.",
                "Missed, Commander. We'll get them on the next salvo.",
            ],
        },
        hostile: {
            hit: [
                "AHHH HAAAAAA. I warned you these waters were mine.",
                "Come on... Your defenses are disappointingly soft...",
                "Yawn~ Try not to make this too easy.",
                "I've sunk better captains before breakfast.",
                "I expected more resistance, Commander noob.",
                "Go back to playing on your pool.",
            ],
            miss: [
                "A rare miscalculation. Do not mistake it for mercy.",
                "Hmph. The shot went wide. Even veterans allow the sea one favour.",
                "Enjoy that breath, Commander — it may be your last.",
                "The waves interfered, nothing more.",
                "Consider it a brief extension of your command.",
                "Your luck is proving annoyingly persistent.",
                "A minor error. Your fleet remains doomed all the same.",
                "The salvo failed to connect. The next one will not.",
                "The sea shields you for now, Commander.",
                "The shot drifted wide. Your survival remains accidental.",
            ],
        },
    };

    const side = attacker === "human" ? "friendly" : "hostile";
    const result = atkRes.isHit ? "hit" : "miss";

    return getRandomDialogue(dialogues[side][result]);
}

function getRandomDialogue(dialogueList) {
    return dialogueList[Math.floor(Math.random() * dialogueList.length)];
}

async function handleTurnFeedback(turnRes, battleView, markerTarget) {
    playCannonFireSound();

    markerTarget === "enemy"
        ? battleView.renderEnemyMarker(turnRes.atkRes)
        : battleView.renderFriendlyMarker(turnRes.atkRes);

    await delay(500);

    turnRes.atkRes.isHit ? playExplosionSound() : playMissedSound();

    const dialogue = generateDialogueMessage(turnRes.atkRes, turnRes.attacker);

    battleView.updateBattleDialogue(turnRes.attacker, dialogue);

    await delay(2000);

    if (!turnRes.isGameOver) {
        battleView.setActiveDialogue(turnRes.nextPlayer);
    }
}
