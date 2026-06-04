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
                expect(cell).toEqual({
                    ship: null,
                    isHit: false,
                });
            });
        });
    });
});

describe("ship placement on gameboard logic", () => {
    let gameboard;
    beforeEach(() => {
        gameboard = new Gameboard();
    });

    it("place ship of size 1", () => {
        const ship = new Ship(1);
        gameboard.placeShip(ship, 1, 1);
        expect(gameboard.board[1][1].ship).toBe(ship);
    });

    it("place ship of size 2 vertically", () => {
        const ship = new Ship(2);
        gameboard.placeShip(ship, 1, 1);
        for (let i = 0; i < ship.length; i++) {
            expect(gameboard.board[1 + i][1].ship).toBe(ship);
        }
    });

    it("place ship of size 2 horizontally", () => {
        const ship = new Ship(2);
        gameboard.placeShip(ship, 1, 1, "horizontal");
        for (let i = 0; i < ship.length; i++) {
            expect(gameboard.board[1][1 + i].ship).toBe(ship);
        }
    });

    it("allows vertical ship to fit exactly at the board edge", () => {
        const ship = new Ship(2);

        gameboard.placeShip(ship, 8, 0, "vertical");

        expect(gameboard.board[8][0].ship).toBe(ship);
        expect(gameboard.board[9][0].ship).toBe(ship);
    });

    it("allows horizontal ship to fit exactly at the board edge", () => {
        const ship = new Ship(2);

        gameboard.placeShip(ship, 0, 8, "horizontal");

        expect(gameboard.board[0][8].ship).toBe(ship);
        expect(gameboard.board[0][9].ship).toBe(ship);
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

describe("receive attack logic", () => {
    let gameboard;
    let ship;

    beforeEach(() => {
        gameboard = new Gameboard();
        ship = new Ship(3);
        gameboard.placeShip(ship, 0, 0, "vertical");
    });

    it("throw error when receieveAttack is called without valid coordinates", () => {
        expect(() => {
            gameboard.receiveAttack();
        }).toThrow("Invalid attack coordinates");
    });

    it("increases ship hits when attack hits a ship", () => {
        gameboard.receiveAttack(0, 0);
        expect(gameboard.board[0][0].ship.hits).toBe(1);
    });

    it("mark cell as hit when attack hits a ship", () => {
        gameboard.receiveAttack(0, 0);
        expect(gameboard.board[0][0].isHit).toBe(true);
    });

    it("mark cell as hit when targeted", () => {
        gameboard.receiveAttack(9, 9);
        expect(gameboard.board[9][9].isHit).toBe(true);
    });

    it("ship is sunk when hits equal ship length", () => {
        gameboard.receiveAttack(0, 0);
        gameboard.receiveAttack(1, 0);
        gameboard.receiveAttack(2, 0);
        expect(gameboard.board[0][0].ship.isSunk()).toBe(true);
    });
});
