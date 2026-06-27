import { ComputerPlayer, HumanPlayer, Player } from "./Player.js";

export class Game {
    static fleet = [
        { name: "Carrier", length: 5 },
        { name: "Battleship", length: 4 },
        { name: "Destroyer", length: 3 },
        { name: "Submarine", length: 3 },
        { name: "Patrol boat", length: 2 },
    ];

    constructor(humanPlayerName) {
        this.humanPlayer = new HumanPlayer(humanPlayerName);
        this.computerPlayer = new ComputerPlayer("Captain Vicious");
        this.currentPlayer = this.humanPlayer;
        this.opponent = this.computerPlayer;
        this.winner = null;
        this.isGameOver = false;
        this.humanPlayerShipIdx = 0;
    }

    // function to set up human player fleet one ship at a time
    placeNextHumanPlayerShip(y, x, orientation) {
        const shipType = Game.fleet[this.humanPlayerShipIdx];
        if (!shipType) {
            throw new Error("No more ship to place");
        }
        const placedShip = this.placeFleetShip(this.humanPlayer, shipType, {
            y,
            x,
            orientation,
        });

        this.humanPlayerShipIdx++;

        return placedShip;
    }

    isHumanFleetPlaced() {
        return this.humanPlayerShipIdx === Game.fleet.length;
    }

    placeComputerFleet() {
        Game.fleet.forEach((shipType) => {
            let placed = false;
            let attempts = 0;
            const maxAttempts = 100;
            while (!placed && attempts < maxAttempts) {
                attempts++;
                const placement = this.computerPlayer.randomPlacement();

                try {
                    this.placeFleetShip(this.computerPlayer, shipType, placement);
                    placed = true;
                } catch {
                    // Invalid placement, try again
                }
            }
        });
    }

    placeFleetShip(player, shipType, placement) {
        return player.gameboard.placeShip(
            shipType.name,
            shipType.length,
            placement.y,
            placement.x,
            placement.orientation,
        );
    }

    runTurn(yAxis, xAxis) {
        if (this.isGameOver) {
            throw new Error("Game is already over");
        }
        // computerPlayer.fire will ignore yAxis, xAxis argument
        const attacker = this.currentPlayer === this.humanPlayer ? "human" : "computer";
        const atkRes = this.currentPlayer.fire(this.opponent, yAxis, xAxis);

        this.updateWinner();

        if (!this.isGameOver) {
            this.switchPlayer();
        }

        return {
            atkRes,
            attacker,
            defender: attacker === "human" ? "computer" : "human",
            isGameOver: this.isGameOver,
            winner: this.winner,
            nextPlayer: attacker === "human" ? "computer" : "human",
        };
    }

    updateWinner() {
        if (this.opponent.gameboard.isAllSunk()) {
            this.winner = this.currentPlayer;
            this.isGameOver = true;
        }
    }

    switchPlayer() {
        [this.currentPlayer, this.opponent] = [this.opponent, this.currentPlayer];
    }

    reset(humanPlayerName, computerPlayerName) {
        this.humanPlayer = new Player(humanPlayerName);
        this.computerPlayer = new ComputerPlayer(computerPlayerName);
        this.currentPlayer = this.humanPlayer;
        this.opponent = this.computerPlayer;
        this.winner = null;
        this.isGameOver = false;
        this.humanPlayerShipIdx = 0;
    }
}
