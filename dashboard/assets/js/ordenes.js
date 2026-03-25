/* ======================================================
   CONFIGURACIÓN GENERAL
====================================================== */
if (!localStorage.getItem("token")) {
    window.location.replace("../login.html"); // .replace es mejor para que no puedan volver atrás
}

const urlApiOrdenes = "https://pratica-5b-node-s1hu.vercel.app/api";

const urlApiOrdenesDetails = "https://pratica-5b-node-s1hu.vercel.app/api";

let todoSeleccionado = false;

function obtenerHeaders() {
    const token = localStorage.getItem("token");

    return {
        "Content-Type": "application/json",
        "Authorization": token ? `Bearer ${token}` : ""
    }
}

function inicializarModuloOrdenes(ruta) {
    const rutaLimpia = ruta.toLowerCase();

    /* =========================
    TODO: CARGAR ORDENES 
    ============================ */

    if (rutaLimpia.includes('ordenes.html')) {
        cargarOrdenes();
    }

}

async function cargarOrdenes() {
    try {
        const res = await fetch(`${urlApiOrdenes}/ordenes`);
        const ordenes = await res.json();

        renderCards(ordenes);
    } catch (error) {
        console.error("Error cargando órdenes", error);
    }
}

window.toggleSeleccionarTodo = function () {
    // Buscamos específicamente los checkboxes de los dispositivos
    const checks = document.querySelectorAll(".device-check");

    if (checks.length === 0) return; // Si no hay dispositivos cargados, no hace nada

    todoSeleccionado = !todoSeleccionado;

    checks.forEach(c => {
        c.checked = todoSeleccionado;
    });

    actualizarTextoBoton();
}

function actualizarTextoBoton() {
    // Buscamos el botón dentro del modal
    const btn = document.querySelector("#modalCrearOrden button[onclick='toggleSeleccionarTodo()']");

    if (!btn) return;

    btn.innerText = todoSeleccionado
        ? "Deseleccionar todo"
        : "Seleccionar todo";

    // Opcional: Cambiar el color para que sea más visual
    btn.classList.toggle("btn-outline-danger", todoSeleccionado);
    btn.classList.toggle("btn-outline-primary", !todoSeleccionado);
}

function renderCards(ordenes) {
    const cont = document.getElementById("listaOrdenes");

    if (!cont) return;

    cont.innerHTML = "";

    ordenes.forEach(orden => {

        const estadoClase = `estado-${orden.estado}`;

        cont.innerHTML += `
        <div class="card card-hover mb-3 p-3"
        onclick="verDetalle(${orden.idOrden})">
        <div class="d-flex justify-content-between align-items-center">
        <h6 class="mb-0">Orden #${orden.idOrden}</h6>
        <span class="estado-badge">${estadoClase}
        ${orden.idOrden}
        </span>
        </div>
        <hr class="my-2">

        <p class="mb-1 text-muted">Laboratorio: 
        <i class="bi bi-building"></i> ${orden.nombreLaboratorio}
        </p>

        <p class="mb-0 text-muted">
        <i class="bi bi-person"></i> ${orden.nombreUsuario}
        </p>

        </div>
        `;
    });
}
window.verDetalle = async function (id) {

    try {
        const res = await fetch(`${urlApiOrdenesDetails}/ordenTrabajo/${id}/pdf`);
        const orden = await res.json();

        renderDetalle(orden);
    } catch (error) {
        console.error(error);
    }

}

function renderDetalle(orden) {

    const cont = document.getElementById("detalleOrden");

    const estadoClase = `estado-${orden.estado}`;

    cont.innerHTML = `
    <div class="d-flex justify-content-between align-items-center">
    <h4>Orden #${orden.idOrden}</h4>
    <span class="estado-badge ${estadoClase}">
        ${orden.estado}
    </span>
    </div>

    <hr>

    <div class="row mb-3">
    <div class="col-md-6">
    <p><b>Administrador:</b><br>${orden.usuario}</p>
    </div>
    <div class="col-md-6">
    <p><b>Laboratorio:</b><br>${orden.laboratorio}</p>
    </div>
    </div>

    <h5>Dispositivos</h5>

    <div class="list-group mb-3">
    ${orden.dispositivos.map(d => `
        <div class="list-group-item d-flex justify-content-between">
        <span>${d.nombre}</span>
        <span class="badge bg-secondary">${d.mantenimiento}</span>
    </div>
    `).join("")}
    </div>

    <button class="btn btn-outline-danger w-100"
    onclick="descargarPDF(${orden.idOrden})">
    Descargar PDF
    </button>
    `;
}
window.abrirModalCrearOrden = function () {
    const modal = new bootstrap.Modal(document.getElementById("modalCrearOrden"));
    modal.show();

    cargarLaboratorios();
}
/* =========================
   CARGAR LABORATORIOS
============================ */
async function cargarLaboratorios() {
    try {
        const res = await fetch("https://pratica-5b-node-s1hu.vercel.app/api/laboratorios");
        const labs = await res.json();
        const select = document.getElementById("labSelect");
        const contDisp = document.getElementById("listaDispositivos");

        select.innerHTML = `<option value="">Selecciona un laboratorio...</option>`;
        if (contDisp) contDisp.innerHTML = `<p class="text-muted">Selecciona un laboratorio primero</p>`;

        labs.forEach(l => {
            select.innerHTML += `<option value="${l.idLaboratorio}">${l.nombreLaboratorio}</option>`;
        });
    } catch (error) {
        console.error("Error al cargar laboratorios", error);
    }
}

/* =========================
   CARGAR DISPOSITIVOS (POR LABORATORIO)
============================ */
document.addEventListener("change", async (e) => {
    if (e.target.id === "labSelect") {
        const idLab = e.target.value;
        const cont = document.getElementById("listaDispositivos");

        if (!idLab) {
            cont.innerHTML = `<p class="text-muted">Selecciona un laboratorio primero</p>`;
            return;
        }

        try {
            const res = await fetch(`https://pratica-5b-node-s1hu.vercel.app/api/dispositivos/laboratorio/${idLab}`);
            const dispositivos = await res.json();
            cont.innerHTML = "";

            dispositivos.forEach(d => {
                cont.innerHTML += `
                <div class="d-flex align-items-center justify-content-between border-bottom py-2">
                    <div class="form-check">
                        <input type="checkbox" class="form-check-input device-check" value="${d.idDispositivo}" id="check_${d.idDispositivo}">
                        <label class="form-check-label" for="check_${d.idDispositivo}">${d.nombreDispositivo}</label>
                    </div>
                    <div>
                        <select class="form-select form-select-sm maint-type" data-device="${d.idDispositivo}" style="width: 130px;">
                            <option value="1">Preventivo</option>
                            <option value="2">Correctivo</option>
                        </select>
                    </div>
                </div>`;

            });
            todoSeleccionado = false; // Reiniciamos el estado
            actualizarTextoBoton();    // Reseteamos el texto del botón
        } catch (error) {
            console.error("Error cargando dispositivos", error);
        }
    }
});

/* =========================
   BOTÓN: CREAR ORDEN
============================ */
window.crearOrden = async function () {
    try {
        const sesion = localStorage.getItem("userSession");
        const usuario = sesion ? JSON.parse(sesion) : null;

        if (!usuario || !usuario.id) {
            return alert("Sesión no válida. Por favor, reingresa.");
        }

        const idLaboratorioRaw = document.getElementById("labSelect").value;
        const checks = document.querySelectorAll(".device-check:checked");

        if (!idLaboratorioRaw || checks.length === 0) {
            return alert("Selecciona laboratorio y al menos un dispositivo.");
        }

        // --- AQUÍ DEFINIMOS EL PAYLOAD (El que te faltaba) ---
        const payload = {
            idUsuario: parseInt(usuario.id),
            idLaboratorio: parseInt(idLaboratorioRaw),
            estado: 'espera',
            insumos: 'Sin especificar',
            horasHombre: 0,
            fechaCreacion: new Date().toISOString().slice(0, 19).replace('T', ' ')
        };

        console.log("Payload que se enviará:", payload); // Para que lo veas en consola

        // 1. PASO 1: Crear la Orden
        const resOrden = await fetch(`${urlApiOrdenes}/ordenes`, {
            method: "POST",
            headers: obtenerHeaders(),
            body: JSON.stringify(payload) // Ahora sí existe 'payload'
        });

        if (!resOrden.ok) {
            const errorServer = await resOrden.json();
            throw new Error(errorServer.message || "Error 403: No tienes permisos o datos inválidos.");
        }

        const nuevaOrden = await resOrden.json();

        // --- 2. PASO 2: Asociar Dispositivos (Uno por uno) ---
        const dispositivosData = Array.from(checks).map(check => ({
            idDispositivo: parseInt(check.value),
            idTipoMantenimiento: parseInt(document.querySelector(`.maint-type[data-device="${check.value}"]`).value)
        }));

        // Usamos un bucle para que el backend reciba exactamente lo que espera
        for (const disp of dispositivosData) {
            const resDetalle = await fetch(`${urlApiOrdenes}/Orden_dispositivos`, {
                method: "POST",
                headers: obtenerHeaders(),
                body: JSON.stringify({
                    idOrden: nuevaOrden.idOrden, // El ID que recibimos del Paso 1
                    idDispositivo: disp.idDispositivo,
                    idTipoMantenimiento: disp.idTipoMantenimiento,
                    realizado: 'no_realizado' // Valor inicial según tu SQL
                })
            });

            if (!resDetalle.ok) {
                console.error(`Error al guardar el dispositivo ${disp.idDispositivo}`);
            }


        }
        // Si llegamos aquí, todo se procesó
        alert(`Orden #${nuevaOrden.idOrden} y dispositivos guardados correctamente ✅`);
        bootstrap.Modal.getInstance(document.getElementById('modalCrearOrden')).hide();
        cargarOrdenes();
    } catch (error) {
        console.error("Fallo:", error);
        alert("Fallo: " + error.message);
    }
}; 