import { Ship } from "./Ship.js";

export class Gameboard {
    constructor(size = 10) {
        this.size = size;
        this.placedShips = [];
        this.board = Array.from({ length: this.size }, () => {
            return Array.from({ length: this.size }, () => ({
                ship: null,
                isHit: false,
            }));
        });
    }

    placeShip(name, length, yAxis, xAxis, orientation = "vertical") {
        const ship = new Ship(name, length);

        // validate orientation
        if (!["vertical", "horizontal"].includes(orientation)) {
            throw new Error("Invalid orientation");
        }

        const directions = {
            vertical: [1, 0],
            horizontal: [0, 1],
        };

        const [yDirection, xDirection] = directions[orientation];

        const coordinates = Array.from({ length: ship.length }, (_, i) => {
            return [yAxis + yDirection * i, xAxis + xDirection * i];
        });

        // validate coordinates
        const isOutOfBounds = coordinates.some(([y, x]) => {
            return y < 0 || y >= this.size || x < 0 || x >= this.size;
        });

        if (isOutOfBounds) {
            throw new Error("Ship cannot be placed outside board");
        }

        // validate cell is empty
        const hasOccupiedCell = coordinates.some(([y, x]) => {
            return this.board[y][x].ship !== null;
        });

        if (hasOccupiedCell) {
            throw new Error("Cell already contains a ship");
        }

        coordinates.forEach(([y, x]) => {
            this.board[y][x] = {
                ship,
                isHit: false,
            };
        });

        this.placedShips.push({
            ship,
            startRow: yAxis,
            startCol: xAxis,
            orientation,
            coordinates,
        });
        return ship;
    }

    isValidCoordinates(y, x) {
        return (
            Number.isInteger(y) &&
            Number.isInteger(x) &&
            y >= 0 &&
            y < this.size &&
            x >= 0 &&
            x < this.size
        );
    }

    receiveAttack(y, x) {
        if (!this.isValidCoordinates(y, x)) {
            throw new Error("Invalid attack coordinates");
        }

        const cell = this.board[y][x];

        if (cell.isHit) {
            throw new Error("Cell has already been hit");
        }

        cell.isHit = true;

        if (cell.ship !== null) {
            cell.ship.hit();
            return {
                isHit: true,
                ship: cell.ship,
                isSunk: cell.ship.isSunk(),
                coord: { y, x },
            };
        }
        return {
            isHit: false,
            ship: null,
            isSunk: false,
            coord: { y, x },
        };
    }

    isAllSunk() {
        return (
            this.placedShips.length > 0 &&
            this.placedShips.every((shipPlacement) =>
                shipPlacement.ship.isSunk(),
            )
        );
    }

    reset() {
        this.placedShips = [];
        this.board = Array.from({ length: this.size }, () => {
            return Array.from({ length: this.size }, () => ({
                ship: null,
                isHit: false,
            }));
        });
    }
}
