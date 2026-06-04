import { Ship } from "../models/Ship.js";

// it("instantiating ship with invalid length throws an errow", () => {
//     expect(() => {
//         const ship = new Ship();
//     }).toThrow("Invalid ship size");

//     expect(() => {
//         const ship = new Ship(0);
//     }).toThrow("Invalid ship size");

//     expect(() => {
//         const ship = new Ship(11);
//     }).toThrow("Invalid ship size");
// });

it.each([undefined, 0, 11, -1, "hello", 2.5])(
    "throws an error when ship length is %s",
    (invalidLength) => {
        expect(() => {
            new Ship(invalidLength);
        }).toThrow("Invalid ship size");
    },
);

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
