import { Ship } from "../models/Ship.js";

it("creates a new ship with a length = 3", () => {
    const ship = new Ship(3);
    expect(ship.length).toBe(3);
});

it("new ship starts with 0 hits", () => {
    const ship = new Ship(3);
    expect(ship.hits).toBe(0);
});

it("hit increases by 1", () => {
    const ship = new Ship(3);
    ship.hit();
    expect(ship.hits).toBe(1);
});

it("ship with length = 3 should sunk after 3 hits", () => {
    const ship = new Ship(3);
    ship.hit();
    ship.hit();
    ship.hit();
    expect(ship.checkIfSunk()).toBe(true);
});
