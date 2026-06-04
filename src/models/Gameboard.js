export class Gameboard {
    constructor(size = 10) {
        this.size = size;
        this.board = Array(size)
            .fill(null)
            .map(() => Array(size).fill(null));
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
            return this.board[y][x] !== null;
        });

        if (hasOccupiedCell) {
            throw new Error("Cell already contains a ship");
        }

        coordinates.forEach(([y, x]) => {
            this.board[y][x] = ship;
        });
    }
}
