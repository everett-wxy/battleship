import { Gameboard } from "./Gameboard.js";

export class Player {
    constructor(name) {
        this.name = name;
        this.gameboard = new Gameboard();
    }

    fire(enemy, yAxis, xAxis) {
        enemy.gameboard.receiveAttack(yAxis, xAxis);
    }
}

export class HumanPlayer extends Player {
    constructor(name) {
        super(name);
        this.type = "human";
    }
}

export class ComputerPlayer extends Player {
    constructor(name) {
        super(name);
        this.type = "computer";
    }

    generateRandomPlacement() {
        return {
            y: Math.floor(Math.random() * this.gameboard.size),
            x: Math.floor(Math.random() * this.gameboard.size),
            orientation: Math.random() < 0.5 ? "vertical" : "horizontal",
        };
    }

    fire(enemy) {
        const { y, x } = this.generateRandomFireCoordinates(enemy);
        enemy.gameboard.receiveAttack(y, x);
    }

    generateRandomFireCoordinates(enemy) {
        // returns an object { y:_ , x:_ }
        return {
            y: Math.floor(Math.random() * enemy.gameboard.size),
            x: Math.floor(Math.random() * enemy.gameboard.size),
        };
    }
}
