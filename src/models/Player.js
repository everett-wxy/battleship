import { Gameboard } from "./Gameboard.js";
import { Ship } from "./Ship.js";

export class Player {
    constructor(name) {
        this.name = name;
        this.gameboard = new Gameboard();
    }

    placeShip(length, yAxis, xAxis, orientation = "vertical") {
        const ship = new Ship(length);
        this.gameboard.placeShip(ship, yAxis, xAxis, orientation);
        return ship;
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
}
