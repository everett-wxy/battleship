// store state?

import { Game } from "../controllers/GameController.js";
import { ComputerPlayer, HumanPlayer } from "../models/Player.js";

afterEach(() => {
  jest.restoreAllMocks();
});

// start game
describe("Game start state", () => {
    let game;

    beforeEach(() => {
        game = new Game("Everett", "Computer");
    });

    it("creates a human player and a computer player", () => {
        expect(game.humanPlayer).toBeInstanceOf(HumanPlayer);
        expect(game.computerPlayer).toBeInstanceOf(ComputerPlayer);
    });

    it("human player is the starting player", () => {
        expect(game.currentPlayer).toBe(game.humanPlayer);
    });

    it("computer is the opponent", () => {
        expect(game.opponent).toBe(game.computerPlayer);
    });

    it("starts with no winner and game is not over", () => {
        expect(game.winner).toBe(null);
        expect(game.isGameOver).toBe(false);
    });
});

describe("Human player ship placement phase", () => {
    let game;

    beforeEach(() => {
        game = new Game("Everett", "Computer");
    });

    it("places first human ship", () => {
        const placedShip = game.placeNextHumanPlayerShip(0, 0, "vertical");

        expect(placedShip.name).toBe("Carrier");

        for (let i = 0; i < placedShip.length; i++) {
            expect(game.humanPlayer.gameboard.board[i][0].ship).toBe(
                placedShip,
            );
        }
    });

    it("move to the next human ship after a successful placement", () => {
        game.placeNextHumanPlayerShip(0, 0, "vertical");
        expect(game.humanPlayerShipIdx).toBe(1);
    });

    it("does not increment human ship index after a failed placement", () => {
        expect(() => {
            game.placeNextHumanPlayerShip(9, 0, "vertical");
        }).toThrow("Ship cannot be placed outside board");

        expect(game.humanPlayerShipIdx).toBe(0);
    });

    it("throws an error when placing another ship after the human fleet is complete", () => {
        Game.fleet.forEach((_, i) => {
            game.placeNextHumanPlayerShip(i, 0, "horizontal");
        });

        expect(() => {
            game.placeNextHumanPlayerShip(5, 0, "horizontal");
        }).toThrow("No more ship to place");
    });

    it("returns true when the entire human fleet is placed", () => {
        Game.fleet.forEach((_, i) => {
            game.placeNextHumanPlayerShip(i, 0, "horizontal");
        });

        expect(game.isHumanFleetPlaced()).toBe(true);
    });
});

describe("Computer player fleet placement", () => {
    let game;

    beforeEach(() => {
        game = new Game("Everett", "Computer");
    });

    it("set up entire fleet of computer", () => {
        const placeShipSpy = jest.spyOn(
            game.computerPlayer.gameboard,
            "placeShip",
        );

        game.placeComputerFleet();
        expect(placeShipSpy.mock.calls.length).toBeGreaterThanOrEqual(5);
        expect(game.computerPlayer.gameboard.ships.length).toBe(5);

        const occupiedCells = game.computerPlayer.gameboard.board
            .flat()
            .filter((cell) => cell.ship !== null);
        expect(occupiedCells.length).toBe(17);
    });
});

describe("Game turn", () => {
    let game;

    beforeEach(() => {
        game = new Game("Everett", "Computer");
    });

    // current player fire
    it("running turn will call current player to fire", () => {
        const fireSpy = jest.spyOn(game.currentPlayer, "fire");

        game.runTurn(0, 0);

        expect(fireSpy).toHaveBeenCalledWith(game.computerPlayer, 0, 0);
    });

    // switch player
    it("switching player changes current player and opponent", () => {
        game.switchPlayer();
        expect(game.currentPlayer).toBe(game.computerPlayer);
        expect(game.opponent).toBe(game.humanPlayer);
    });

    it("switch player at the end of a turn", () => {
        game.runTurn(0, 0);
        expect(game.currentPlayer).toBe(game.computerPlayer);
    });

    it("ends the game and sets human player as winner when computer ship is sunk", () => {
        game.computerPlayer.gameboard.placeShip(undefined, 1, 0, 0, "vertical");

        game.runTurn(0, 0);

        expect(game.winner).toBe(game.humanPlayer);
        expect(game.isGameOver).toBe(true);
    });

    it("ends the game and sets computer player as winner when human ship is sunk", () => {
        game.humanPlayer.gameboard.placeShip(undefined, 1, 0, 0, "vertical");
        game.switchPlayer();
        jest.spyOn(
            game.computerPlayer,
            "randomTarget",
        ).mockReturnValue({ y: 0, x: 0 });

        game.runTurn();

        expect(game.humanPlayer.gameboard.board[0][0].isHit).toBe(true);
        expect(game.winner).toBe(game.computerPlayer);
        expect(game.isGameOver).toBe(true);
    });

    it("does not switch player after a winning shot", () => {
        const switchSpy = jest.spyOn(game, "switchPlayer");
        game.computerPlayer.gameboard.placeShip(undefined, 1, 0, 0, "vertical");

        game.runTurn(0, 0);
        expect(switchSpy).not.toHaveBeenCalled();
    });

    it("throws an error when running a turn after game is over", () => {
        game.computerPlayer.gameboard.placeShip(undefined, 1, 0, 0, "vertical");

        game.runTurn(0, 0);

        expect(() => {
            game.runTurn(1, 1);
        }).toThrow("Game is already over");
    });
});
