import { Gameboard } from "../models/Gameboard.js";
import { Ship } from "../models/Ship.js";

describe("Gameboard", () => {
    let gameboard;
    beforeEach(() => {
        gameboard = new Gameboard();
    });

    it("size of board should be 10 by 10", () => {
        expect(gameboard.size).toBe(10);
    });

    it("board should contain 2d array of 10x10", () => {
        expect(gameboard.board.length).toBe(10);

        gameboard.board.forEach((row) => {
            expect(row.length).toBe(10);
        });
    });

    it("start with all null", () => {
        gameboard.board.forEach((row) => {
            row.forEach((cell) => {
                expect(cell).toBe(null);
            });
        });
    });
});

describe("ship placement on gameboard", () => {
    let gameboard;
    beforeEach(() => {
        gameboard = new Gameboard();
    });

    it("place ship of size 1", () => {
        const ship = new Ship(1);
        gameboard.placeShip(ship, 1, 1);
        expect(gameboard.board[1][1]).toBe(ship);
    });

    it("place ship of size 2 vertically", () => {
        const ship = new Ship(2);
        gameboard.placeShip(ship, 1, 1);
        for (let i = 0; i < ship.length; i++) {
            expect(gameboard.board[1 + i][1]).toBe(ship);
        }
    });

    it("place ship of size 2 horizontally", () => {
        const ship = new Ship(2);
        gameboard.placeShip(ship, 1, 1, "horizontal");
        for (let i = 0; i < ship.length; i++) {
            expect(gameboard.board[1][1 + i]).toBe(ship);
        }
    });

    it("allows vertical ship to fit exactly at the board edge", () => {
        const ship = new Ship(2);

        gameboard.placeShip(ship, 8, 0, "vertical");

        expect(gameboard.board[8][0]).toBe(ship);
        expect(gameboard.board[9][0]).toBe(ship);
    });

    it("allows horizontal ship to fit exactly at the board edge", () => {
        const ship = new Ship(2);

        gameboard.placeShip(ship, 0, 8, "horizontal");

        expect(gameboard.board[0][8]).toBe(ship);
        expect(gameboard.board[0][9]).toBe(ship);
    });

    it("Throw error when vertical ship exceed gameboard boundary", () => {
        const ship = new Ship(3);
        expect(() => {
            gameboard.placeShip(ship, 8, 0, "vertical");
        }).toThrow("Ship cannot be placed outside board");
    });

    it("Throw error when horizontal ship exceed gameboard boundary", () => {
        const ship = new Ship(3);
        expect(() => {
            gameboard.placeShip(ship, 0, 8, "horizontal");
        }).toThrow("Ship cannot be placed outside board");
    });

    it("Throw error when ship is placed at an occupied cell", () => {
        const ship1 = new Ship(3);
        const ship2 = new Ship(3);

        gameboard.placeShip(ship1, 0, 0);

        expect(() => {
            gameboard.placeShip(ship2, 0, 0);
        }).toThrow("Cell already contains a ship");
    });

    it("throws error when any part of the ship overlaps another ship", () => {
        const ship1 = new Ship(3);
        const ship2 = new Ship(3);

        gameboard.placeShip(ship1, 7, 2, "vertical");

        expect(() => {
            gameboard.placeShip(ship2, 9, 0, "horizontal");
        }).toThrow("Cell already contains a ship");
    });
});
