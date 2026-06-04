export class Ship {
    constructor(length) {
        if (!Number.isInteger(length) || length < 1 || length > 10) {
            throw new Error("Invalid ship size");
        }
        this.length = length;
        this.hits = 0;
    }

    hit() {
        this.hits++;
    }

    checkIfSunk() {
        return this.hits >= this.length;
    }
}
