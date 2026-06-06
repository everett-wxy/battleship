// store state?

import { Game } from "../controllers/GameController.js";
import { ComputerPlayer, HumanPlayer } from "../models/Player.js";

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

describe("Ship placement phase", () => {
    let game;

    beforeEach(() => {
        game = new Game("Everett", "Computer");
    });

    it("human player place 5 ships at the start of the game", () => {
        const placeShipSpy = jest.spyOn(
            game.humanPlayer.gameboard,
            "placeShip",
        );

        game.setUpFleet(game.humanPlayer, [
            { y: 0, x: 0, orientation: "horizontal" },
            { y: 1, x: 0, orientation: "horizontal" },
            { y: 2, x: 0, orientation: "horizontal" },
            { y: 3, x: 0, orientation: "horizontal" },
            { y: 4, x: 0, orientation: "horizontal" },
        ]);
        expect(placeShipSpy).toHaveBeenCalledTimes(5);
        expect(game.humanPlayer.gameboard.ships.length).toBe(5);
        
        // count that gameboard.board should contains a total of 17 filled cells
        const occupiedCells = game.humanPlayer.gameboard.board
            .flat()
            .filter((cell) => cell.ship !== null);
        expect(occupiedCells.length).toBe(17)
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
        game.runTurn(0, 0);
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
