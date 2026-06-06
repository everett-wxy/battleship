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

        computerShip = computerPlayer.gameboard.placeShip(1, 0, 0);
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
