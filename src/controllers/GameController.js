import { ComputerPlayer, HumanPlayer } from "../models/Player.js";

export class Game {
    constructor(humanPlayerName, computerPlayerName) {
        this.humanPlayer = new HumanPlayer(humanPlayerName);
        this.computerPlayer = new ComputerPlayer(computerPlayerName);
        this.currentPlayer = this.humanPlayer;
        this.opponent = this.computerPlayer;
        this.winner = null;
        this.isGameOver = false;
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
