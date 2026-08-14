// =====================================================
// FINTRACK - PERFIL
// Código simple: DOM, eventos, validación y localStorage.
// =====================================================

// 1. DATOS INICIALES Y ELEMENTOS DEL HTML
const AVATAR_DEFAULT = "images/avatar-default.png";
const FOTO_ORIGINAL =
    "https://images.unsplash.com/photo-1600486913747-55e5470d6f40?auto=format&fit=crop&q=80&w=1160";

const NOMBRE_INICIAL = "Eric";
const APELLIDO_INICIAL = "Frusciante";
const CORREO_INICIAL = "eric@frusciante.com";

const formPerfil = document.getElementById("formPerfil");
const nombre = document.getElementById("nombre");
const apellido = document.getElementById("apellido");
const correo = document.getElementById("correo");

const fotoUsuario = document.getElementById("fotoUsuario");
const fotoPreview = document.getElementById("fotoPreview");
const fotoPerfilVista = document.getElementById("fotoPerfilVista");
const quitarFoto = document.getElementById("quitarFoto");
const fotoAyuda = document.getElementById("fotoAyuda");

const nombrePerfilVista = document.getElementById("nombrePerfilVista");
const correoPerfilVista = document.getElementById("correoPerfilVista");
const sidebarFoto = document.getElementById("sidebarFoto");
const sidebarNombre = document.getElementById("sidebarNombre");
const sidebarCorreo = document.getElementById("sidebarCorreo");

const presupuesto = document.getElementById("presupuesto");
const metaAhorro = document.getElementById("metaAhorro");
const guardarPresupuesto = document.getElementById("guardarPresupuesto");
const guardarMeta = document.getElementById("guardarMeta");

const moneda = document.getElementById("moneda");
const simboloPresupuesto = document.getElementById("simboloPresupuesto");
const simboloMeta = document.getElementById("simboloMeta");

const modoOscuro = document.getElementById("modoOscuro");
const perfilContenido = document.getElementById("perfilContenido");

let fotoTemporal = FOTO_ORIGINAL;


// 2. CARGAR Y MOSTRAR LOS DATOS DEL USUARIO
// Lee los datos guardados. Si no existen, usa los datos de Eric.
function cargarUsuario() {
    const nombreGuardado = localStorage.getItem("fintrackNombre") || NOMBRE_INICIAL;
    const apellidoGuardado = localStorage.getItem("fintrackApellido") || APELLIDO_INICIAL;
    const correoGuardado = localStorage.getItem("fintrackCorreo") || CORREO_INICIAL;
    const fotoGuardada = localStorage.getItem("fintrackFoto") || FOTO_ORIGINAL;

    const nombreCompleto = nombreGuardado + " " + apellidoGuardado;

    nombre.value = nombreGuardado;
    apellido.value = apellidoGuardado;
    correo.value = correoGuardado;

    nombrePerfilVista.textContent = nombreCompleto;
    correoPerfilVista.textContent = correoGuardado;
    fotoPerfilVista.src = fotoGuardada;

    sidebarNombre.textContent = nombreCompleto;
    sidebarCorreo.textContent = correoGuardado;
    sidebarFoto.src = fotoGuardada;

    fotoTemporal = fotoGuardada;
    fotoPreview.src = fotoGuardada;
    fotoUsuario.value = "";
}


// 3. CAMBIAR O QUITAR LA FOTO
// La foto se muestra primero en vista previa y se guarda al guardar el perfil.
fotoUsuario.addEventListener("change", () => {
    const archivo = fotoUsuario.files[0];

    if (!archivo) return;

    if (!archivo.type.startsWith("image/")) {
        fotoAyuda.textContent = "Selecciona una imagen válida.";
        fotoUsuario.value = "";
        return;
    }

    if (archivo.size > 2 * 1024 * 1024) {
        fotoAyuda.textContent = "La imagen debe pesar menos de 2 MB.";
        fotoUsuario.value = "";
        return;
    }

    const lector = new FileReader();

    lector.onload = (event) => {
        fotoTemporal = event.target.result;
        fotoPreview.src = fotoTemporal;
        fotoAyuda.textContent = "Imagen. Máximo 2 MB.";
    };

    lector.readAsDataURL(archivo);
});

quitarFoto.addEventListener("click", () => {
    fotoTemporal = AVATAR_DEFAULT;
    fotoPreview.src = AVATAR_DEFAULT;
    fotoUsuario.value = "";
    fotoAyuda.textContent = "Imagen. Máximo 2 MB.";
});


// 4. VALIDAR Y GUARDAR EL PERFIL
// Bootstrap usa la clase is-invalid para mostrar invalid-feedback.
function validarFormulario() {
    let valido = true;

    nombre.classList.remove("is-invalid");
    apellido.classList.remove("is-invalid");
    correo.classList.remove("is-invalid");

    if (!nombre.value.trim()) {
        nombre.classList.add("is-invalid");
        valido = false;
    }

    if (!apellido.value.trim()) {
        apellido.classList.add("is-invalid");
        valido = false;
    }

    if (!correo.value.trim() || !correo.validity.valid) {
        correo.classList.add("is-invalid");
        valido = false;
    }

    return valido;
}

formPerfil.addEventListener("submit", (event) => {
    event.preventDefault(); // Evita que el formulario recargue la página.

    if (!validarFormulario()) return;

    localStorage.setItem("fintrackNombre", nombre.value.trim());
    localStorage.setItem("fintrackApellido", apellido.value.trim());
    localStorage.setItem("fintrackCorreo", correo.value.trim());
    localStorage.setItem("fintrackFoto", fotoTemporal);

    cargarUsuario();
});


// 5. MONEDAS
// Estos son los únicos objetos del archivo.
const PEN = {
    codigo: "PEN",
    nombre: "Sol peruano",
    simbolo: "S/"
};

const USD = {
    codigo: "USD",
    nombre: "Dólar estadounidense",
    simbolo: "$"
};

const EUR = {
    codigo: "EUR",
    nombre: "Euro",
    simbolo: "€"
};

function obtenerDatosMoneda(codigo) {
    if (codigo === "USD") return USD;
    if (codigo === "EUR") return EUR;
    return PEN;
}

function actualizarMoneda(codigo) {
    const datos = obtenerDatosMoneda(codigo);

    simboloPresupuesto.textContent = datos.simbolo;
    simboloMeta.textContent = datos.simbolo;
    moneda.value = datos.codigo;
}

moneda.addEventListener("change", () => {
    localStorage.setItem("fintrackMoneda", moneda.value);
    actualizarMoneda(moneda.value);
});


// 6. PRESUPUESTO Y META DE AHORRO
// La única alerta aparece si la cantidad no es mayor a cero.
guardarPresupuesto.addEventListener("click", () => {
    const valor = Number(presupuesto.value);

    if (valor <= 0) {
        alert("Ingresa una cantidad mayor a 0.");
        return;
    }

    localStorage.setItem("fintrackPresupuesto", valor);
});

guardarMeta.addEventListener("click", () => {
    const valor = Number(metaAhorro.value);

    if (valor <= 0) {
        alert("Ingresa una cantidad mayor a 0.");
        return;
    }

    localStorage.setItem("fintrackMetaAhorro", valor);
});


// 7. MODO OSCURO
// checked devuelve true si el switch está activado y false si está apagado.
modoOscuro.addEventListener("change", () => {
    if (modoOscuro.checked) {
        perfilContenido.classList.add("profile-dark");
        localStorage.setItem("fintrackModoOscuro", "true");
    } else {
        perfilContenido.classList.remove("profile-dark");
        localStorage.setItem("fintrackModoOscuro", "false");
    }
});


// 8. CARGAR TODO AL ENTRAR A PERFIL
function cargarDatosIniciales() {
    cargarUsuario();

    presupuesto.value = localStorage.getItem("fintrackPresupuesto") || "";
    metaAhorro.value = localStorage.getItem("fintrackMetaAhorro") || "";

    const monedaGuardada = localStorage.getItem("fintrackMoneda") || "PEN";
    actualizarMoneda(monedaGuardada);

    const oscuroGuardado = localStorage.getItem("fintrackModoOscuro") === "true";
    modoOscuro.checked = oscuroGuardado;

    if (oscuroGuardado) {
        perfilContenido.classList.add("profile-dark");
    } else {
        perfilContenido.classList.remove("profile-dark");
    }
}

cargarDatosIniciales();
