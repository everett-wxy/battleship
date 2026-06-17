import { Game } from "../models/GameSession.js";
import { Gameboard } from "../models/Gameboard.js";
import { HumanPlayer, ComputerPlayer } from "../models/Player.js";

afterEach(() => {
    jest.restoreAllMocks();
});

describe("Player", () => {
    let human;
    let computer;

    beforeEach(() => {
        human = new HumanPlayer("Everett");
        computer = new ComputerPlayer("Computer");
    });
    it("has a name", () => {
        expect(human.name).toBe("Everett");
    });

    it("has its own gameboard", () => {
        expect(human.gameboard).toBeInstanceOf(Gameboard);
    });

    it("each player has a separate gameboard", () => {
        expect(human.gameboard).not.toBe(computer.gameboard);
    });
});

describe("Player fire", () => {
    let humanPlayer;
    let computerPlayer;
    let computerShip;

    beforeEach(() => {
        humanPlayer = new HumanPlayer("Everett");
        computerPlayer = new ComputerPlayer("Computer");

        computerShip = computerPlayer.gameboard.placeShip(undefined, 1, 0, 0);
    });

    it("fires at the enemy gameboard", () => {
        humanPlayer.fire(computerPlayer, 0, 0);

        expect(computerPlayer.gameboard.board[0][0].isHit).toBe(true);
    });

    it("hits the enemy ship when firing at its coordinate", () => {
        humanPlayer.fire(computerPlayer, 0, 0);

        expect(computerShip.isSunk()).toBe(true);
        expect(computerPlayer.gameboard.isAllSunk()).toBe(true);
    });
});

describe("Computer fire logic", () => {
    let game;
    beforeEach(() => {
        game = new Game("Everett", "Computer");
    });

    it("update shipsStruck property after computer attacks succesfully", () => {
        const ship = game.humanPlayer.gameboard.placeShip(
            undefined,
            1,
            0,
            0,
            "vertical",
        );

        game.switchPlayer();

        jest.spyOn(game.computerPlayer, "randomTarget").mockReturnValue({
            y: 0,
            x: 0,
        });

        game.runTurn();
        expect(game.computerPlayer.struck).toEqual([
            {
                ship: ship,
                isSunk: true,
                coord: [{ y: 0, x: 0 }],
            },
        ]);
    });

    it("update same struck ship after smart targeting hits it again", () => {
        const ship = game.humanPlayer.gameboard.placeShip(
            undefined,
            2,
            0,
            0,
            "horizontal",
        );

        jest.spyOn(game.computerPlayer, "randomTarget").mockReturnValueOnce({
            y: 0,
            x: 0,
        });

        game.computerPlayer.fire(game.humanPlayer); // controlled random target

        jest.spyOn(game.computerPlayer, "pickRandom").mockReturnValue({
            y: 0,
            x: 1,
        });

        game.computerPlayer.fire(game.humanPlayer); // smart targ

        expect(game.computerPlayer.struck).toEqual([
            {
                ship: ship,
                isSunk: true,
                coord: [
                    { y: 0, x: 0 },
                    { y: 0, x: 1 },
                ],
            },
        ]);
    });

    it("struck property do not change after computer attacks missed", () => {
        game.humanPlayer.gameboard.placeShip(undefined, 1, 0, 0, "vertical");
        game.switchPlayer();

        jest.spyOn(game.computerPlayer, "randomTarget").mockReturnValue({
            y: 1,
            x: 0,
        });

        game.runTurn();
        expect(game.computerPlayer.struck).toEqual([]);
    });

    it("does not include out-of-bound adjacent cells as candidates after hitting a corner ship", () => {
        game.humanPlayer.gameboard.placeShip(undefined, 2, 0, 0, "horizontal");

        jest.spyOn(game.computerPlayer, "randomTarget").mockReturnValueOnce({
            y: 0,
            x: 0,
        });

        game.computerPlayer.fire(game.humanPlayer);

        const pickRandomSpy = jest.spyOn(game.computerPlayer, "pickRandom");

        game.computerPlayer.fire(game.humanPlayer);

        const candidates = pickRandomSpy.mock.calls[0][0];

        const invalidCoords = [
            { y: -1, x: 0 },
            { y: 0, x: -1 },
        ];

        invalidCoords.forEach((coord) => {
            expect(candidates).not.toContainEqual(coord);
        });
    });

    it("target an adjacent cell after the computer hits a ship", () => {
        game.humanPlayer.gameboard.placeShip(undefined, 2, 4, 4, "vertical");
        game.switchPlayer();

        jest.spyOn(game.computerPlayer, "randomTarget").mockReturnValueOnce({
            y: 4,
            x: 4,
        });

        game.runTurn();

        game.switchPlayer();

        // check if computer fire on adjacent cells
        const validAdjacentCoordinates = [
            { y: 3, x: 4 },
            { y: 5, x: 4 },
            { y: 4, x: 3 },
            { y: 4, x: 5 },
        ];
        const turnResult = game.runTurn();
        expect(validAdjacentCoordinates).toContainEqual(turnResult.atkResult.coord);
    });

    it("falls back to random targeting when no valid smart targets remain", () => {
        game.humanPlayer.gameboard.placeShip(undefined, 1, 4, 4, "vertical");

        game.computerPlayer.struck = [
            {
                ship: game.humanPlayer.gameboard.board[4][4].ship,
                isSunk: false,
                coord: [{ y: 4, x: 4 }],
            },
        ];

        game.humanPlayer.gameboard.receiveAttack(4, 4);

        // Surrounding cells already attacked
        game.humanPlayer.gameboard.receiveAttack(3, 4);
        game.humanPlayer.gameboard.receiveAttack(5, 4);
        game.humanPlayer.gameboard.receiveAttack(4, 3);
        game.humanPlayer.gameboard.receiveAttack(4, 5);

        const randomTargetSpy = jest
            .spyOn(game.computerPlayer, "randomTarget")
            .mockReturnValue({
                y: 7,
                x: 7,
            });

        const atkRes = game.computerPlayer.fire(game.humanPlayer);

        expect(randomTargetSpy).toHaveBeenCalled();
        expect(atkRes.coord).toEqual({
            y: 7,
            x: 7,
        });
    });

    it("target horizontal cell after the computer struck a horiztonal ship twice", () => {
        const ship = game.humanPlayer.gameboard.placeShip(
            undefined,
            3,
            0,
            0,
            "horizontal",
        );

        // stimulate ship has been struck twice

        game.computerPlayer.struck = [
            {
                ship: ship,
                isSunk: false,
                coord: [
                    { y: 0, x: 0 },
                    { y: 0, x: 1 },
                ],
            },
        ];

        game.humanPlayer.gameboard.receiveAttack(0, 0);
        game.humanPlayer.gameboard.receiveAttack(0, 1);

        const atkRes = game.computerPlayer.fire(game.humanPlayer);

        expect(atkRes.coord).toEqual({
            y: 0,
            x: 2,
        });
    });

    it("target vertical cell after the computer struck a vertical ship twice", () => {
        const ship = game.humanPlayer.gameboard.placeShip(
            undefined,
            3,
            0,
            0,
            "vertical",
        );

        // stimulate ship has been struck twice

        game.computerPlayer.struck = [
            {
                ship: ship,
                isSunk: false,
                coord: [
                    { y: 0, x: 0 },
                    { y: 1, x: 0 },
                ],
            },
        ];

        game.humanPlayer.gameboard.receiveAttack(0, 0);
        game.humanPlayer.gameboard.receiveAttack(1, 0);

        const atkRes = game.computerPlayer.fire(game.humanPlayer);

        expect(atkRes.coord).toEqual({
            y: 2,
            x: 0,
        });
    });

    it("target gap cell after the computer struck both edges of a ship", () => {
        const ship = game.humanPlayer.gameboard.placeShip(
            undefined,
            3,
            0,
            0,
            "vertical",
        );

        // stimulate ship has been struck twice

        game.computerPlayer.struck = [
            {
                ship: ship,
                isSunk: false,
                coord: [
                    { y: 0, x: 0 },
                    { y: 2, x: 0 },
                ],
            },
        ];

        game.humanPlayer.gameboard.receiveAttack(0, 0);
        game.humanPlayer.gameboard.receiveAttack(2, 0);

        const atkRes = game.computerPlayer.fire(game.humanPlayer);

        expect(atkRes.coord).toEqual({
            y: 1,
            x: 0,
        });
    });

    it("does not include already attacked adjacent cells as smart target candidates", () => {
        game.humanPlayer.gameboard.placeShip(undefined, 2, 4, 4, "vertical");

        jest.spyOn(game.computerPlayer, "randomTarget").mockReturnValueOnce({
            y: 4,
            x: 4,
        });

        game.computerPlayer.fire(game.humanPlayer); // Fire on y:4, x:4

        // Simulate one adjacent cell already attacked/missed
        game.humanPlayer.gameboard.receiveAttack(3, 4);

        const pickRandomSpy = jest.spyOn(game.computerPlayer, "pickRandom");

        game.computerPlayer.fire(game.humanPlayer);

        const candidates = pickRandomSpy.mock.calls[0][0];

        expect(candidates).not.toContainEqual({
            y: 3,
            x: 4,
        });
    });

    it("uses random targeting instead of smart targeting when there is no unsunk ship in struck", () => {
        const ship = game.humanPlayer.gameboard.placeShip(
            undefined,
            1,
            0,
            0,
            "vertical",
        );

        game.computerPlayer.struck = [
            {
                ship,
                isSunk: true,
                coord: [{ y: 0, x: 0 }],
            },
        ];

        const smartTargetSpy = jest.spyOn(game.computerPlayer, "smartTarget");

        const randomTargetSpy = jest.spyOn(game.computerPlayer, "randomTarget");

        game.computerPlayer.fire(game.humanPlayer);

        expect(smartTargetSpy).not.toHaveBeenCalled();
        expect(randomTargetSpy).toHaveBeenCalled();
    });
});
