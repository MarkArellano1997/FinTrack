const usuarios = [
    {
        id: 1,
        nombre: "Marcos",
        correo: "marcos@fintrack.com",
        password: "123456"
    },
    {
        id: 2,
        nombre: "Ana",
        correo: "ana@fintrack.com",
        password: "123456"
    },
    {
        id: 3,
        nombre: "Carlos",
        correo: "carlos@fintrack.com",
        password: "123456"
    },
    {
        id: 4,
        nombre: "Lucía",
        correo: "lucia@fintrack.com",
        password: "123456"
    },
    {
        id: 5,
        nombre: "Diego",
        correo: "diego@fintrack.com",
        password: "123456"
    }
];

const correo = document.getElementById("correo")
const contraseña = document.getElementById("contraseña")
const button = document.getElementById("button")
const body = document.querySelector("body")


const accionButton = button.addEventListener("click", () => validarUsuario())

const validarUsuario = () => {
    const usuarioencontrado = usuarios.find(usuario => usuario.correo === correo.value && usuario.password === contraseña.value)
    const alertaExistente = document.getElementById("alerta-login")
    if (alertaExistente) {
        return
    }
    const alerta = document.createElement("div")
    alerta.id = "alerta-login"

    if (correo.value === "" && contraseña.value === "") {
        alerta.innerHTML = `<div class="p-4 mb-4 text-sm text-red-800 text-center rounded-lg bg-red-100">
                                <span class="font-medium">Por favor, completa todos los campos.</span>
                            </div>`
        body.prepend(alerta)
        setTimeout(() => {
            alerta.remove()
        }, 4000);
        return
    } else if(contraseña.value === ""){
        alerta.innerHTML = `<div class="p-4 mb-4 text-sm text-red-800 text-center rounded-lg bg-red-100">
                                <span class="font-medium">Ingresa tu contraseña.</span>
                            </div>`
        body.prepend(alerta)
        setTimeout(() => {
            alerta.remove()
        }, 4000);
        return
    }

    if (usuarioencontrado) {
        alerta.innerHTML = `<div class="p-4 mb-4 text-sm text-green-800 text-center rounded-lg bg-green-100">
                                <span class="font-medium">Inicio de sesión exitoso.</span>
                            </div>`
        body.prepend(alerta)
        setTimeout(() => {
            alerta.remove()
            window.location.href = "inicio.html"
        }, 4000);
    } else {
        alerta.innerHTML = `<div class="p-4 mb-4 text-sm text-red-800 text-center rounded-lg bg-red-100">
                                <span class="font-medium">Usuario o contraseña incorrectos.</span>
                            </div>`
        body.prepend(alerta)
        setTimeout(() => {
            alerta.remove()
        }, 10000);
    }
}


