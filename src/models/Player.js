import { Gameboard } from "./Gameboard.js";

export class Player {
    constructor(name) {
        this.name = name;
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
        const target = this.getTarget();

        const coord = target
            ? this.smartTarget(enemy, target)
            : this.randomTarget(enemy);

        const atkResult = enemy.gameboard.receiveAttack(coord.y, coord.x);

        this.updateTargets(atkResult);

        return atkResult;
    }

    getTarget() {
        return this.struck.find((target) => !target.isSunk);
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
        const candidateCoord =
            target.coord.length === 1
                ? this.adjTargets(target.coord[0])
                : this.lineTargets(target);

        const validCoord = this.validTargets(enemy, candidateCoord);

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
        const x = coord[0].x;
        const yValues = coord.map((coord) => coord.y);

        const minY = Math.min(...yValues);
        const maxY = Math.max(...yValues);
        const currentSpan = maxY - minY + 1;

        const targets = [];

        // Fill gaps between successful hits
        for (let y = minY + 1; y < maxY; y++) {
            targets.push({ y, x });
        }

        // Extend outward if the known span is shorter than the ship length
        if (currentSpan < shipLen) {
            targets.push({ y: minY - 1, x });
            targets.push({ y: maxY + 1, x });
        }

        return targets;
    }

    horizontalTargets(coord, shipLen) {
        const y = coord[0].y;
        const xValues = coord.map((coord) => coord.x);

        const minX = Math.min(...xValues);
        const maxX = Math.max(...xValues);
        const currentSpan = maxX - minX + 1;

        const targets = [];

        // Fill gaps between successful hits
        for (let x = minX + 1; x < maxX; x++) {
            targets.push({ y, x });
        }

        // Extend outward if the known span is shorter than the ship length
        if (currentSpan < shipLen) {
            targets.push({ y, x: minX - 1 });
            targets.push({ y, x: maxX + 1 });
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

        throw new Error(
            "Coordinates are not horizontally or vertically aligned",
        );
    }

    validTargets(enemy, coord) {
        return coord.filter(({ y, x }) => {
            return (
                enemy.gameboard.isValidCoordinates(y, x) &&
                !enemy.gameboard.board[y][x].isHit
            );
        });
    }

    pickRandom(coord) {
        return coord[Math.floor(Math.random() * coord.length)];
    }

    updateTargets(atkResult) {
        if (!atkResult.isHit) return;

        const existingTarget = this.struck.find((target) => {
            return target.ship === atkResult.ship;
        });

        if (existingTarget) {
            existingTarget.isSunk = atkResult.isSunk;
            existingTarget.coord.push(atkResult.coord);
            return;
        }

        this.struck.push({
            ship: atkResult.ship,
            isSunk: atkResult.isSunk,
            coord: [atkResult.coord],
        });
    }
}
