/* 
   REPORTES.JS
    */


const KEY_STORAGE = "fincontrol_movimientos";

// CATEGORÍAS

const CATEGORIAS = {

    sueldo: {
        nombre: "Sueldo",
        icono: "💼"
    },

    comida: {
        nombre: "Comida",
        icono: "🍔"
    },

    transporte: {
        nombre: "Transporte",
        icono: "🚗"
    },

    entretenimiento: {
        nombre: "Entretenimiento",
        icono: "🎬"
    },

    salud: {
        nombre: "Salud",
        icono: "🏥"
    },

    compras: {
        nombre: "Compras",
        icono: "🛍️"
    },

    servicios: {
        nombre: "Servicios",
        icono: "💡"
    },

    otros: {
        nombre: "Otros",
        icono: "📦"
    }

};

// VARIABLES

let movimientos = [];

let mesSeleccionado = "";

let categoriaSeleccionada = "todas";

// ELEMENTOS HTML

const mesReporte =
    document.getElementById("mesReporte");

const categoriaReporte =
    document.getElementById("categoriaReporte");

// CARGAR MOVIMIENTOS

function cargarMovimientos() {

    const guardado =
        localStorage.getItem(KEY_STORAGE);


    if (guardado === null) {

        console.log(
            "No existen movimientos guardados."
        );

        movimientos = [];

        return;

    }

    try {

        movimientos =
            JSON.parse(guardado);


        console.log(
            "Movimientos cargados:",
            movimientos
        );


    } catch (error) {

        console.error(
            "Error leyendo localStorage:",
            error
        );

        movimientos = [];

    }

}

// FORMATO DE MONEDA

function formatoDinero(numero) {

    return "S/ " +
        Number(numero).toLocaleString(
            "es-PE",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );

}

// MES ACTUAL

function obtenerMesActual() {

    const fecha =
        new Date();


    const año =
        fecha.getFullYear();


    const mes =
        String(
            fecha.getMonth() + 1
        ).padStart(2, "0");


    return `${año}-${mes}`;

}

// NOMBRE DEL MES

function obtenerNombreMes(mes) {

    const fecha =
        new Date(
            mes + "-01T00:00:00"
        );


    return fecha.toLocaleDateString(
        "es-PE",
        {
            month: "long",
            year: "numeric"
        }
    );

}

// OBTENER MESES

function obtenerMeses() {

    const meses = [];

    movimientos.forEach(
        function(movimiento) {

            if (!movimiento.fecha) {
                return;
            }


            const mes =
                movimiento.fecha.substring(
                    0,
                    7
                );


            if (!meses.includes(mes)) {

                meses.push(mes);

            }

        }
    );


    // Agregar mes actual

    const actual =
        obtenerMesActual();


    if (!meses.includes(actual)) {

        meses.push(actual);

    }


    // Ordenar

    meses.sort(
        function(a, b) {

            return b.localeCompare(a);

        }
    );


    return meses;

}

// LLENAR SELECTOR DE MESES

function cargarSelectorMes() {

    mesReporte.innerHTML = "";


    const meses =
        obtenerMeses();


    meses.forEach(
        function(mes) {

            const opcion =
                document.createElement(
                    "option"
                );


            opcion.value =
                mes;


            opcion.textContent =
                obtenerNombreMes(mes);


            mesReporte.appendChild(
                opcion
            );

        }
    );


    mesSeleccionado =
        meses[0] ||
        obtenerMesActual();


    mesReporte.value =
        mesSeleccionado;

}

// LLENAR SELECTOR DE CATEGORÍAS

function cargarSelectorCategoria() {

    categoriaReporte.innerHTML = "";


    const todas =
        document.createElement(
            "option"
        );

    todas.value =
        "todas";


    todas.textContent =
        "Todas";


    categoriaReporte.appendChild(
        todas
    );

    Object.entries(CATEGORIAS)
        .forEach(
            function([clave, categoria]) {

                const opcion =
                    document.createElement(
                        "option"
                    );


                opcion.value =
                    clave;


                opcion.textContent =
                    `${categoria.icono} ${categoria.nombre}`;


                categoriaReporte.appendChild(
                    opcion
                );

            }
        );

}

// OBTENER MOVIMIENTOS DEL MES

function movimientosDelMes() {

    return movimientos.filter(
        function(movimiento) {

            if (!movimiento.fecha) {

                return false;

            }


            return movimiento.fecha
                .substring(0, 7)
                === mesSeleccionado;

        }
    );

}

// APLICAR CATEGORÍA

function movimientosFiltrados() {

    let lista =
        movimientosDelMes();


    if (
        categoriaSeleccionada !==
        "todas"
    ) {

        lista =
            lista.filter(
                function(movimiento) {

                    return movimiento.categoria ===
                        categoriaSeleccionada;

                }
            );

    }

    return lista;
}

// INGRESOS

function calcularIngresos(lista) {

    return lista.reduce(
        function(total, movimiento) {

            if (
                movimiento.tipo ===
                "ingreso"
            ) {

                return total +
                    Number(movimiento.monto);

            }


            return total;

        },
        0
    );

}

// GASTOS

function calcularGastos(lista) {

    return lista.reduce(
        function(total, movimiento) {

            if (
                movimiento.tipo ===
                "gasto"
            ) {

                return total +
                    Number(movimiento.monto);

            }

            return total;

        },
        0
    );

}

// MOSTRAR RESUMEN

function mostrarResumen() {

    const lista =
        movimientosFiltrados();


    const ingresos =
        calcularIngresos(lista);


    const gastos =
        calcularGastos(lista);


    const balance =
        ingresos - gastos;


    document.getElementById(
        "textoMes"
    ).textContent =
        "Resumen de " +
        obtenerNombreMes(
            mesSeleccionado
        );


    document.getElementById(
        "totalIngresos"
    ).textContent =
        formatoDinero(ingresos);


    document.getElementById(
        "totalGastos"
    ).textContent =
        formatoDinero(gastos);


    document.getElementById(
        "totalBalance"
    ).textContent =
        formatoDinero(balance);


    const balanceElemento =
        document.getElementById(
            "totalBalance"
        );


    balanceElemento.style.color =
        balance >= 0
            ? "#059669"
            : "#e11d48";

}

// INGRESOS VS GASTOS

function mostrarComparacion() {

    const lista =
        movimientosFiltrados();


    const ingresos =
        calcularIngresos(lista);


    const gastos =
        calcularGastos(lista);


    document.getElementById(
        "labelIngresos"
    ).textContent =
        formatoDinero(ingresos);


    document.getElementById(
        "labelGastos"
    ).textContent =
        formatoDinero(gastos);


    const mayor =
        Math.max(
            ingresos,
            gastos
        );


    let porcentajeIngresos = 0;

    let porcentajeGastos = 0;


    if (mayor > 0) {

        porcentajeIngresos =
            (ingresos / mayor) * 100;


        porcentajeGastos =
            (gastos / mayor) * 100;

    }


    document.getElementById(
        "barraIngresos"
    ).style.width =
        porcentajeIngresos + "%";


    document.getElementById(
        "barraGastos"
    ).style.width =
        porcentajeGastos + "%";


    const mensaje =
        document.getElementById(
            "mensajeComparacion"
        );


    if (
        ingresos === 0 &&
        gastos === 0
    ) {

        mensaje.textContent =
            "No existen movimientos para este filtro.";

    }

    else if (
        ingresos > gastos
    ) {

        mensaje.textContent =
            "Tus ingresos fueron mayores que tus gastos.";

    }

    else if (
        gastos > ingresos
    ) {

        mensaje.textContent =
            "Tus gastos fueron mayores que tus ingresos.";

    }

    else {

        mensaje.textContent =
            "Tus ingresos y gastos fueron iguales.";

    }

}

// GASTOS POR CATEGORÍA

function mostrarCategorias() {

    /*
       Queremos mostrar la comparación de
       todas las categorías.
    */

    const lista =
        movimientosDelMes();


    const gastos = {};

    lista.forEach(
        function(movimiento) {

            if (
                movimiento.tipo !==
                "gasto"
            ) {

                return;

            }


            const categoria =
                movimiento.categoria;


            if (!gastos[categoria]) {

                gastos[categoria] =
                    0;

            }


            gastos[categoria] +=
                Number(movimiento.monto);

        }
    );


    const categorias =
        Object.entries(gastos);


    categorias.sort(
        function(a, b) {

            return b[1] - a[1];

        }
    );


    const contenedor =
        document.getElementById(
            "categoriasLista"
        );


    const mensaje =
        document.getElementById(
            "sinCategorias"
        );


    contenedor.innerHTML = "";


    if (
        categorias.length === 0
    ) {

        mensaje.classList.remove(
            "hidden"
        );

        return;

    }


    mensaje.classList.add(
        "hidden"
    );

    const mayor =
        categorias[0][1];


    categorias.forEach(
        function([clave, monto]) {

            const categoria =
                CATEGORIAS[clave] ||
                CATEGORIAS.otros;


            const porcentaje =
                (monto / mayor) * 100;


            const elemento =
                document.createElement(
                    "div"
                );


            elemento.className =
                "category-item";


            elemento.innerHTML = `

                <div class="category-info">

                    <span>
                        ${categoria.icono}
                        ${categoria.nombre}
                    </span>

                    <strong>
                        ${formatoDinero(monto)}
                    </strong>

                </div>


                <div class="category-bar-background">

                    <div
                        class="category-bar"
                        style="width: ${porcentaje}%">
                    </div>

                </div>

            `;


            contenedor.appendChild(
                elemento
            );

        }
    );
}

// BALANCE

function mostrarBalance() {

    const lista =
        movimientosFiltrados();


    const ingresos =
        calcularIngresos(lista);


    const gastos =
        calcularGastos(lista);


    const balance =
        ingresos - gastos;


    document.getElementById(
        "balanceFinal"
    ).textContent =
        formatoDinero(balance);


    const descripcion =
        document.getElementById(
            "balanceDescripcion"
        );


    const tarjeta =
        document.getElementById(
            "balanceCard"
        );


    tarjeta.style.borderColor =
        balance >= 0
            ? "#10b981"
            : "#f43f5e";


    if (balance > 0) {

        descripcion.textContent =
            "Tus ingresos fueron mayores que tus gastos.";

    }

    else if (balance < 0) {

        descripcion.textContent =
            "Tus gastos fueron mayores que tus ingresos.";

    }

    else {

        descripcion.textContent =
            "Tus ingresos y gastos fueron iguales.";

    }
}

// ACTUALIZAR REPORTE

function actualizarReporte() {

    mostrarResumen();

    mostrarComparacion();

    mostrarCategorias();

    mostrarBalance();
}

// EVENTOS

mesReporte.addEventListener(
    "change",
    function() {

        mesSeleccionado =
            this.value;

        actualizarReporte();
    }
);

categoriaReporte.addEventListener(
    "change",
    function() {

        categoriaSeleccionada =
            this.value;


        actualizarReporte();

    }
);

// INICIO

function iniciarReportes() {

    cargarMovimientos();

    cargarSelectorMes();

    cargarSelectorCategoria();

    actualizarReporte();
}
iniciarReportes();