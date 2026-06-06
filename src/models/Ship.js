export class Ship {
    constructor(name = "Ship", length) {
        if (!Number.isInteger(length) || length < 1 || length > 10) {
            throw new Error("Invalid ship size");
        }
        this.name = name;
        this.length = length;
        this.hits = 0;
    }

    hit() {
        this.hits++;
    }

    isSunk() {
        return this.hits >= this.length;
    }
}
