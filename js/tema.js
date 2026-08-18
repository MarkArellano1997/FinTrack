function aplicarTemaFinTrack() {
    const oscuro = localStorage.getItem("fintrackModoOscuro") === "true";
    document.body.classList.toggle("fintrack-dark", oscuro);
}

aplicarTemaFinTrack();

window.addEventListener("storage", (event) => {
    if (event.key === "fintrackModoOscuro") {
        aplicarTemaFinTrack();
    }
});
