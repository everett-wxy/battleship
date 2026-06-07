import { Game } from "../controllers/GameController.js";
import { Gameboard } from "../models/Gameboard.js";
import { HumanPlayer, ComputerPlayer } from "../models/Player.js";

describe("Player", () => {
    let human;
    let computer;

    beforeEach(() => {
        human = new HumanPlayer("Everett");
        computer = new ComputerPlayer("Computer");
    });
    it("has a name", () => {
        expect(human.name).toBe("Everett");
    });

    it("has its own gameboard", () => {
        expect(human.gameboard).toBeInstanceOf(Gameboard);
    });

    it("each player has a separate gameboard", () => {
        expect(human.gameboard).not.toBe(computer.gameboard);
    });
});

describe("Player fire", () => {
    let humanPlayer;
    let computerPlayer;
    let computerShip;

    beforeEach(() => {
        humanPlayer = new HumanPlayer("Everett");
        computerPlayer = new ComputerPlayer("Computer");

        computerShip = computerPlayer.gameboard.placeShip(undefined, 1, 0, 0);
    });

    it("fires at the enemy gameboard", () => {
        humanPlayer.fire(computerPlayer, 0, 0);

        expect(computerPlayer.gameboard.board[0][0].isHit).toBe(true);
    });

    it("hits the enemy ship when firing at its coordinate", () => {
        humanPlayer.fire(computerPlayer, 0, 0);

        expect(computerShip.isSunk()).toBe(true);
        expect(computerPlayer.gameboard.isAllSunk()).toBe(true);
    });
});

describe("Computer fire logic", () => {
    let game;
    beforeEach(() => {
        game = new Game("Everett", "Computer");
    });

    it("update shipsStruck property after computer attacks succesfully", () => {
        const ship = game.humanPlayer.gameboard.placeShip(
            undefined,
            1,
            0,
            0,
            "vertical",
        );

        game.switchPlayer();

        jest.spyOn(
            game.computerPlayer,
            "generateRandomFireCoordinates",
        ).mockReturnValue({ y: 0, x: 0 });

        game.runTurn();
        expect(game.computerPlayer.shipsStruck).toEqual([
            {
                ship: ship,
                isShipSunk: true,
                coordinatesOfSuccessfulAtk: [{ y: 0, x: 0 }],
            },
        ]);
    });

    it("last shipsStruck property do not change after computer attacks missed", () => {
        game.humanPlayer.gameboard.placeShip(undefined, 1, 0, 0, "vertical");
        game.switchPlayer();

        jest.spyOn(
            game.computerPlayer,
            "generateRandomFireCoordinates",
        ).mockReturnValue({ y: 1, x: 0 });

        game.runTurn();
        expect(game.computerPlayer.shipsStruck).toEqual([]);
    });

    it("target an adjacent cell after the computer hits a ship", () => {
        game.humanPlayer.gameboard.placeShip(undefined, 2, 4, 4, "vertical");
        game.switchPlayer();

        jest.spyOn(
            game.computerPlayer,
            "generateRandomFireCoordinates",
        ).mockReturnValueOnce({ y: 4, x: 4 });

        game.runTurn();

        game.switchPlayer();

        // check if computer fire on adjacent cells
        const validAdjacentCoordinates = [
            { y: 3, x: 4 },
            { y: 5, x: 4 },
            { y: 4, x: 3 },
            { y: 4, x: 5 },
        ];
        const atkResult = game.runTurn();
        console.log(atkResult);
        expect(validAdjacentCoordinates).toContainEqual(atkResult.coordinates);
    });

    it("target ");
});
