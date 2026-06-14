export function renderAttackMarker(markerOverlay, atkRes) {
    const { y, x } = atkRes.coord;

    const marker = document.createElement("div");
    marker.classList.add("atk-marker");

    if (atkRes.isHit) {
        marker.classList.add("hit-marker");
        marker.innerText = "x";
    } else {
        marker.classList.add("miss-marker");
        marker.innerText = "•";
    }

    marker.style.gridArea = `${y + 1} / ${x + 1} / ${y + 2} / ${x + 2}`;

    markerOverlay.append(marker);
}
