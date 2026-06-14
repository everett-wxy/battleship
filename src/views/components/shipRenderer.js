import carrierIcon from "../../assets/carrier.svg";
import battleshipIcon from "../../assets/battleship.svg";
import destroyerIcon from "../../assets/destroyer.svg";
import submarineIcon from "../../assets/submarine.svg";
import patrolBoatIcon from "../../assets/patrol-boat.svg";

export const shipIcons = {
    carrier: carrierIcon,
    battleship: battleshipIcon,
    destroyer: destroyerIcon,
    submarine: submarineIcon,
    "patrol-boat": patrolBoatIcon,
};

export function renderPlacedShip(shipOverlay, shipPlacement) {
    const { ship, startRow, startCol, orientation } = shipPlacement;

    const shipName = ship.name.toLowerCase().replaceAll(" ", "-");

    const gridShipContainer = document.createElement("div");
    gridShipContainer.classList.add("grid-ship-container", orientation);
    gridShipContainer.style.setProperty("--ship-length", ship.length);

    const gridStartRow = startRow + 1;
    const gridStartCol = startCol + 1;

    const gridEndRow =
        orientation === "horizontal"
            ? startRow + 2
            : startRow + 1 + ship.length;

    const gridEndCol =
        orientation === "horizontal"
            ? startCol + 1 + ship.length
            : startCol + 2;

    gridShipContainer.style.gridArea = `${gridStartRow} / ${gridStartCol} / ${gridEndRow} / ${gridEndCol}`;

    const gridShip = document.createElement("img");
    gridShip.classList.add("grid-ship");
    gridShip.src = shipIcons[shipName];
    gridShip.alt = shipName;
    gridShip.draggable = false;

    gridShipContainer.append(gridShip);
    shipOverlay.append(gridShipContainer);
}
