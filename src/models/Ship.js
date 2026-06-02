export class Ship {
    constructor(length) {
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
