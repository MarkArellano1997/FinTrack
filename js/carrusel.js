let posicion = 0;
const totalImagenes = 3;

function mostrarImagen() {
    const carrusel = document.getElementById("carrusel");

    carrusel.style.transform =
        `translateX(-${posicion * 100}%)`;
}

function siguiente() {
    posicion++;

    if (posicion >= totalImagenes) {
        posicion = 0;
    }

    mostrarImagen();
}

function anterior() {
    posicion--;

    if (posicion < 0) {
        posicion = totalImagenes - 1;
    }

    mostrarImagen();
}