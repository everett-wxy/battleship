import { Gameboard } from "./Gameboard.js";

export class Player {
    constructor(name) {
        this.name = name.trim().charAt(0).toUpperCase() + name.trim().slice(1).toLowerCase();
        this.gameboard = new Gameboard();
    }

    fire(enemy, yAxis, xAxis) {
        return enemy.gameboard.receiveAttack(yAxis, xAxis);
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
        this.struck = []; // struck ships
    }

    randomPlacement() {
        return {
            x: Math.floor(Math.random() * this.gameboard.size),
            y: Math.floor(Math.random() * this.gameboard.size),
            orientation: Math.random() < 0.5 ? "vertical" : "horizontal",
        };
    }

    fire(enemy) {
        const target = this.struck.find((target) => !target.isSunk);

        const coord = target ? this.smartTarget(enemy, target) : this.randomTarget(enemy);

        const atkRes = enemy.gameboard.receiveAttack(coord.y, coord.x);

        this.updateTargets(atkRes);

        return atkRes;
    }

    randomTarget(enemy) {
        let coord;

        do {
            coord = {
                y: Math.floor(Math.random() * enemy.gameboard.size),
                x: Math.floor(Math.random() * enemy.gameboard.size),
            };
        } while (enemy.gameboard.board[coord.y][coord.x].isHit);

        return coord;
    }

    smartTarget(enemy, target) {
        const candidateCoord = target.coord.length === 1 ? this.adjTargets(target.coord[0]) : this.lineTargets(target);

        const validCoord = this.validateTargets(enemy, candidateCoord);

        if (validCoord.length === 0) {
            return this.randomTarget(enemy);
        }

        return this.pickRandom(validCoord);
    }

    adjTargets({ y, x }) {
        return [
            { y: y - 1, x },
            { y: y + 1, x },
            { y, x: x + 1 },
            { y, x: x - 1 },
        ];
    }

    lineTargets(target) {
        const coord = target.coord;
        const shipLen = target.ship.length;

        const axis = this.getAxis(coord[0], coord[1]);

        if (axis === "y") {
            return this.verticalTargets(coord, shipLen);
        }

        if (axis === "x") {
            return this.horizontalTargets(coord, shipLen);
        }

        return [];
    }

    verticalTargets(coord, shipLen) {
        return this.lineTargetsByAxis(coord, shipLen, "y");
    }

    horizontalTargets(coord, shipLen) {
        return this.lineTargetsByAxis(coord, shipLen, "x");
    }

    lineTargetsByAxis(coord, shipLen, changingAxis) {
        const fixedAxis = changingAxis === "y" ? "x" : "y";

        const fixedValue = coord[0][fixedAxis];
        const values = coord.map((c) => c[changingAxis]);

        const min = Math.min(...values);
        const max = Math.max(...values);
        const currentSpan = max - min + 1;

        const targets = [];

        // Fill gaps between successful hits
        for (let value = min + 1; value < max; value++) {
            targets.push({
                [changingAxis]: value,
                [fixedAxis]: fixedValue,
            });
        }

        // Extend outward if known span is shorter than ship length
        if (currentSpan < shipLen) {
            targets.push({
                [changingAxis]: min - 1,
                [fixedAxis]: fixedValue,
            });

            targets.push({
                [changingAxis]: max + 1,
                [fixedAxis]: fixedValue,
            });
        }

        return targets;
    }

    getAxis(coord1, coord2) {
        if (coord1.y !== coord2.y && coord1.x === coord2.x) {
            return "y";
        }

        if (coord1.x !== coord2.x && coord1.y === coord2.y) {
            return "x";
        }

        if (coord1.x === coord2.x && coord1.y === coord2.y) {
            return null;
        }

        throw new Error("Coordinates are not horizontally or vertically aligned");
    }

    validateTargets(enemy, coord) {
        return coord.filter(({ y, x }) => {
            return enemy.gameboard.isValidCoordinates(y, x) && !enemy.gameboard.board[y][x].isHit;
        });
    }

    pickRandom(coord) {
        return coord[Math.floor(Math.random() * coord.length)];
    }

    updateTargets(atkRes) {
        if (!atkRes.isHit) return;

        const existingTarget = this.struck.find((target) => {
            return target.ship === atkRes.ship;
        });

        if (existingTarget) {
            existingTarget.isSunk = atkRes.isSunk;
            existingTarget.coord.push(atkRes.coord);
            return;
        }

        this.struck.push({
            ship: atkRes.ship,
            isSunk: atkRes.isSunk,
            coord: [atkRes.coord],
        });
    }
}
