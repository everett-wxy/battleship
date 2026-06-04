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

describe("Player ship placement", () => {
    it("places a ship on player's gameboard vertically", () => {
        const player = new HumanPlayer("Everett");

        const ship = player.placeShip(3, 0, 0);

        expect(player.gameboard.ships[0]).toBe(ship);

        expect(player.gameboard.board[0][0].ship).toBe(ship);
        expect(player.gameboard.board[1][0].ship).toBe(ship);
        expect(player.gameboard.board[2][0].ship).toBe(ship);
    });

    it("places a ship horizontally on player's gameboard", () => {
        const player = new HumanPlayer("Everett");
        // const ship = player.buildShip(3);
        const ship = player.placeShip(3, 0, 0, "horizontal");

        expect(player.gameboard.board[0][0].ship).toBe(ship);
        expect(player.gameboard.board[0][1].ship).toBe(ship);
        expect(player.gameboard.board[0][2].ship).toBe(ship);
    });

    it("throws an error when placing a ship outside the player's gameboard", () => {
        const player = new HumanPlayer("Everett");

        expect(() => {
            player.placeShip(3, 8, 0, "vertical");
        }).toThrow("Ship cannot be placed outside board");
    });
});

describe("Player fire", () => {
    let humanPlayer;
    let computerPlayer;
    let computerShip;

    beforeEach(() => {
        humanPlayer = new HumanPlayer("Everett");
        computerPlayer = new ComputerPlayer("Computer");

        computerShip = computerPlayer.placeShip(1, 0, 0);
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
