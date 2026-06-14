export function createBoardComponent(board) {
    const gridMapContainer = document.createElement("div");
    gridMapContainer.classList.add("grid-map-container");

    const { numAxis, letterAxis } = createAxisLabels();

    const boardWrapper = document.createElement("div");
    boardWrapper.classList.add("board-wrapper");

    const gridMap = createGridMap(board);

    const shipOverlay = document.createElement("div");
    shipOverlay.classList.add("ship-overlay");

    const markerOverlay = document.createElement("div");
    markerOverlay.classList.add("marker-overlay");

    boardWrapper.append(gridMap, shipOverlay, markerOverlay);
    gridMapContainer.append(numAxis, letterAxis, boardWrapper);

    return {
        gridMapContainer,
        gridMap,
        shipOverlay,
        markerOverlay,
    };
}

function createAxisLabels() {
    const numAxis = document.createElement("div");
    numAxis.classList.add("number-axis");

    const letterAxis = document.createElement("div");
    letterAxis.classList.add("letter-axis");

    for (let i = 0; i < 10; i += 1) {
        const number = document.createElement("div");
        number.classList.add("number");
        number.innerText = `${i + 1}`;
        numAxis.append(number);

        const letter = document.createElement("div");
        letter.classList.add("letter");
        letter.innerText = String.fromCharCode(65 + i);
        letterAxis.append(letter);
    }

    return { numAxis, letterAxis };
}

function createGridMap(board) {
    const gridMap = document.createElement("div");
    gridMap.classList.add("grid-map");

    board.forEach(function (row, rowIndex) {
        row.forEach(function (cell, colIndex) {
            const cellEl = document.createElement("div");

            cellEl.classList.add("grid-cell");
            cellEl.dataset.row = rowIndex;
            cellEl.dataset.col = colIndex;

            gridMap.append(cellEl);
        });
    });

    return gridMap;
}
