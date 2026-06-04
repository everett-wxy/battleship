export class Gameboard {
    constructor(size = 10) {
        this.size = size;
        this.ships = [];
        this.board = Array.from({ length: size }, () => {
            return Array.from({ length: size }, () => ({
                ship: null,
                isHit: false,
            }));
        });
    }

    placeShip(ship, yAxis, xAxis, orientation = "vertical") {
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

        const isOutOfBounds = coordinates.some(([y, x]) => {
            return y < 0 || y >= this.size || x < 0 || x >= this.size;
        });

        if (isOutOfBounds) {
            throw new Error("Ship cannot be placed outside board");
        }

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

        this.ships.push(ship);
    }

    isValidCoordindates(y, x) {
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
        if (!this.isValidCoordindates(y, x)) {
            throw new Error("Invalid attack coordinates");
        }

        const cell = this.board[y][x];

        if (cell.isHit) {
            throw new Error("Cell has already been hit");
        }

        cell.isHit = true;

        if (cell.ship !== null) {
            cell.ship.hit();
        }
    }

    isAllSunk() {
        return this.ships.length > 0 && this.ships.every((ship) => ship.isSunk());
    }
}
