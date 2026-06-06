import { ComputerPlayer, HumanPlayer } from "../models/Player.js";

export class Game {
    static fleet = [
        { name: "Carrier", length: 5 },
        { name: "Battleship", length: 4 },
        { name: "Destroyer", length: 3 },
        { name: "Submarine", length: 3 },
        { name: "Patrol boat", length: 2 },
    ];

    constructor(humanPlayerName, computerPlayerName) {
        this.humanPlayer = new HumanPlayer(humanPlayerName);
        this.computerPlayer = new ComputerPlayer(computerPlayerName);
        this.currentPlayer = this.humanPlayer;
        this.opponent = this.computerPlayer;
        this.winner = null;
        this.isGameOver = false;
    }

    setUpFleet(player, placements) {
        Game.fleet.forEach((shipType, index) => {
            const placement = placements[index];
            // placement = array containing 5 objects { y:_, x:_, orientation:_ }

            player.gameboard.placeShip(
                shipType.name,
                shipType.length,
                placement.y,
                placement.x,
                placement.orientation,
            );
        });
    }

    runTurn(yAxis, xAxis) {
        if (this.isGameOver) {
            throw new Error("Game is already over");
        }

        this.currentPlayer.fire(this.opponent, yAxis, xAxis);
        this.updateWinner();

        if (!this.isGameOver) {
            this.switchPlayer();
        }
    }

    updateWinner() {
        if (this.opponent.gameboard.isAllSunk()) {
            this.winner = this.currentPlayer;
            this.isGameOver = true;
        }
    }

    switchPlayer() {
        [this.currentPlayer, this.opponent] = [
            this.opponent,
            this.currentPlayer,
        ];
    }
}
