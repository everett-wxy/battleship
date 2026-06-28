export function renderAttackMarker(markerOverlay, atkRes) {
    const { y, x } = atkRes.coord;
    const marker = document.createElement("div");
    marker.classList.add("atk-marker", atkRes.isHit ? "hit-marker" : "miss-marker");
    marker.style.gridArea = `${y + 1} / ${x + 1} / ${y + 2} / ${x + 2}`;

    const aimFlash = document.createElement("div");
    aimFlash.classList.add("aim-flash");

    marker.append(aimFlash);

    markerOverlay.append(marker);
}
