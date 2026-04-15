/* ======================================================
    ? CONFIGURACIÓN GENERAL
====================================================== */


const urlApiOrdenes = "https://pratica-5b-node-s1hu.vercel.app/api";

const urlApiOrdenesDetails = "https://pratica-5b-node-s1hu.vercel.app/api";

let todoSeleccionado = false;

let idOrdenADescargar = null;



function inicializarModuloOrdenes(ruta) {
    const rutaLimpia = ruta.toLowerCase();

    /* =========================
    TODO: CARGAR ORDENES 
    ============================ */

    if (rutaLimpia.includes('ordenes.html')) {
        cargarOrdenes();


        const btnBorrar = document.getElementById("btnConfirmarDescargar");

        if (btnBorrar) {
            btnBorrar.onclick = confirmarDescargaOrden;
        }
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

    // ! Buscamos específicamente los checkboxes de los dispositivos
    const checks = document.querySelectorAll(".device-check");

    if (checks.length === 0) return; // ? Si no hay dispositivos cargados, no hace nada

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

    // VALIDACIÓN: ¿Ya tiene insumos registrados? (aunque siga en espera)
    const tieneInsumos = orden.insumos && orden.insumos !== 'Sin especificar' && orden.horasHombre > 0;

    cont.innerHTML = `
    <div class="d-flex justify-content-between align-items-center">
        <h4>Orden #${orden.idOrden}</h4>
        <span class="estado-badge ${estadoClase}">${orden.estado.toUpperCase()}</span>
    </div>
    <hr>
    
    <div class="row mb-3">
        <div class="col-md-6">
            <p class="mb-1 text-muted small">ADMINISTRADOR: <b>${orden.usuario}</b></p>
            <p class="mb-1 text-muted small">LABORATORIO: <b>${orden.laboratorio}</b></p>
        </div>
        <div class="col-md-6 text-end">
            <p class="mb-0"><b>Insumos:</b> ${orden.insumos || 'Pendiente'}</p>
            <p class="mb-0"><b>Horas:</b> ${orden.horasHombre || 0} hrs</p>
        </div>
    </div>

    <div class="d-grid gap-2 mt-3">
        <button class="btn btn-primary" onclick="abrirModalFinalizar(${orden.idOrden})">
            <i class="bi bi-pencil-fill"></i> Registrar Insumos y Horas
        </button>

        ${tieneInsumos
            ? `<button class="btn btn-outline-danger" onclick="prepararDescargaOrden(${orden.idOrden},'${orden.usuario}')">
                <i class="bi bi-file-earmark-pdf"></i> Descargar para Firma
               </button>`
            : `<button class="btn btn-light text-muted border" disabled>
                <i class="bi bi-lock"></i> PDF Bloqueado (Faltan Insumos)
               </button>`
        }
        <h5>Equipos en mantenimiento</h5>
    <div class="list-group mb-3">
        ${orden.dispositivos.map(d => `
            <div class="list-group-item d-flex justify-content-between align-items-center">
                <span>${d.nombre}</span>
                <span class="badge bg-secondary">${d.mantenimiento}</span>
            </div>
        `).join("")}
    </div>

        ${tieneInsumos && orden.estado === 'espera' ? `
            <button class="btn btn-success" onclick="cambiarEstadoAceptado(${orden.idOrden})">
                <i class="bi bi-check-all"></i> Marcar como Aceptada
            </button>
        ` : ''}
    </div>
    `;
}

/* ========================================
 ! PREPARAR DESCARGA PDF 
=========================================== */

window.prepararDescargaOrden = function (id, nombre) {

    idOrdenADescargar = id;

    const nombreElemento = document.getElementById("nombreCreadorOrden")

    if (nombreElemento) {
        nombreElemento.innerHTML = nombre;
    }

    const miModal = new bootstrap.Modal(
        document.getElementById("modalDescargarOrden")
    );

    miModal.show();
}

window.abrirModalCrearOrden = function () {
    const modal = new bootstrap.Modal(document.getElementById("modalCrearOrden"));
    modal.show();

    cargarLaboratorios();
}

/* =========================
   ! CARGAR LABORATORIOS
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
  ! CARGAR DISPOSITIVOS (POR LABORATORIO)
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
   BOTÓN: CREAR ORDEN (CORREGIDO)
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

        const payload = {
            idUsuario: parseInt(usuario.id),
            idLaboratorio: parseInt(idLaboratorioRaw),
            estado: 'espera',
            insumos: 'Sin especificar',
            horasHombre: 0,
            fechaCreacion: new Date().toISOString().slice(0, 19).replace('T', ' ')
        };

        // --- 1. PASO 1: Crear la Orden (RUTA: /ordenes) ---
        // Antes tenías aquí /orden_dispositivo/ y por eso el backend se quejaba
        const resOrden = await fetch(`${urlApiOrdenes}/ordenes`, {
            method: "POST",
            headers: obtenerHeaders(),
            body: JSON.stringify(payload)
        });

        if (!resOrden.ok) {
            const errorServer = await resOrden.json();
            throw new Error(errorServer.message || "Error al crear la cabecera de la orden.");
        }

        const nuevaOrden = await resOrden.json();

        // IMPORTANTE: Verifica si tu backend devuelve .id o .idOrden
        const idOrdenGenerada = nuevaOrden.idOrden || nuevaOrden.id;

        // --- 2. PASO 2: Asociar Dispositivos (RUTA: /orden_dispositivo/) ---
        const dispositivosData = Array.from(checks).map(check => ({
            idDispositivo: parseInt(check.value),
            idTipoMantenimiento: parseInt(document.querySelector(`.maint-type[data-device="${check.value}"]`).value)
        }));

        for (const disp of dispositivosData) {
            const resDetalle = await fetch(`${urlApiOrdenes}/orden_dispositivo`, {
                method: "POST",
                headers: obtenerHeaders(),
                body: JSON.stringify({
                    idOrden: idOrdenGenerada,
                    idDispositivo: disp.idDispositivo,
                    idTipoMantenimiento: disp.idTipoMantenimiento,
                    realizado: 'no_realizado'
                })
            });

            if (!resDetalle.ok) {
                console.error(`Error al guardar el dispositivo ${disp.idDispositivo}`);
            }
        }

        alert(`Orden #${idOrdenGenerada} creada correctamente ✅`);
        bootstrap.Modal.getInstance(document.getElementById('modalCrearOrden')).hide();
        cargarOrdenes();

    } catch (error) {
        console.error("Fallo:", error);
        alert("Fallo: " + error.message);
    }
};

// ! Función para abrir el modal de actualización
window.abrirModalFinalizar = function (id) {
    // Guardamos el ID en el input oculto que pusimos en el HTML
    document.getElementById("idOrdenFinalizar").value = id;

    // Limpiamos los inputs por si acaso
    document.getElementById("inputInsumos").value = "";
    document.getElementById("inputHoras").value = "";

    // Mostramos el modal
    const modal = new bootstrap.Modal(document.getElementById("modalFinalizarOrden"));
    modal.show();
}
// ! Función que conecta con el Backend
window.guardarDatosFinales = async function () {
    const id = document.getElementById("idOrdenFinalizar").value;
    const insumos = document.getElementById("inputInsumos").value;
    const horas = document.getElementById("inputHoras").value;

    if (!insumos || !horas) return alert("Por favor completa los datos.");

    try {
        // La URL debe terminar en /horasHombre según tu router
        const res = await fetch(`${urlApiOrdenes}/ordenTrabajo/${id}/horasHombre`, {
            method: "PATCH", // Tu router usa PATCH en la línea 17
            headers: obtenerHeaders(),
            body: JSON.stringify({
                insumos: insumos,
                horasHombre: parseInt(horas)
            })
        });

        if (res.ok) {
            alert("Insumos registrados correctamente ✅");
            bootstrap.Modal.getInstance(document.getElementById("modalFinalizarOrden")).hide();
            cargarOrdenes();
            verDetalle(id);
        } else {
            alert("Error al guardar. Revisa que el token no haya expirado (403/500).");
        }
    } catch (error) {
        alert("Error de conexión");
    }
}

const confirmarDescargaOrden = async () => {
    if (!idOrdenADescargar) return;
    try {
        const res = await fetch(`${urlApiOrdenesDetails}/ordenTrabajo/${idOrdenADescargar}/pdf`, { headers: obtenerHeaders() });
        const data = await res.json();

        // Validar insumos antes de generar
        if (!data.insumos || data.insumos === 'Sin especificar' || data.horasHombre <= 0) {
            return alert("La orden debe tener insumos y horas para generar el reporte.");
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const azulP = [28, 40, 51], azulD = [52, 152, 219];

        // Logos y Encabezado
        doc.addImage("../img/logoCarrera.png", 'PNG', 15, 8, 22, 22);
        doc.addImage("../img/logoUthh.png", 'PNG', 173, 8, 22, 22);

        doc.setFillColor(...azulP);
        doc.rect(0, 35, 210, 15, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.text("REPORTE TÉCNICO DE MANTENIMIENTO", 20, 44);
        doc.setFontSize(9);
        doc.text(`FOLIO: #00${data.idOrden}`, 190, 44, { align: "right" });

        // Cuerpo del PDF
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(11);
        doc.text("INFORMACIÓN TÉCNICA", 20, 60);
        doc.setDrawColor(...azulD);
        doc.line(20, 62, 190, 62);

        doc.setFontSize(10);
        doc.text(`Técnico: ${data.usuario}`, 25, 70);
        doc.text(`Laboratorio: ${data.laboratorio}`, 25, 77);
        doc.text(`Insumos: ${data.insumos}`, 25, 84);
        doc.text(`Tiempo Invertido: ${data.horasHombre} horas`, 120, 84);

        doc.autoTable({
            startY: 95,
            head: [['ID', 'EQUIPO', 'MANTENIMIENTO']],
            body: data.dispositivos.map(d => [d.id, d.nombre, d.mantenimiento.toUpperCase()]),
            theme: 'striped',
            headStyles: { fillColor: azulP }
        });

        const finalY = doc.lastAutoTable.finalY + 30;
        doc.line(35, finalY, 85, finalY);
        doc.line(125, finalY, 175, finalY);
        doc.setFontSize(8);
        doc.text("FIRMA RESPONSABLE", 60, finalY + 5, { align: "center" });
        doc.text("FIRMA CONFORMIDAD", 150, finalY + 5, { align: "center" });

        doc.save(`Reporte_OT_${data.idOrden}.pdf`);
        bootstrap.Modal.getInstance(document.getElementById("modalDescargarOrden")).hide();
    } catch (error) { alert("Error al procesar el reporte."); }
};

window.cambiarEstadoAceptado = async function (id) {

    if (!confirm("¿Deseas marcar la orden como ACEPTADA?")) return;

    try {
        // La URL debe terminar en /estado según tu router
        const res = await fetch(`${urlApiOrdenes}/ordenTrabajo/${id}/estado`, {
            method: "PATCH", // Tu router usa PATCH en la línea 17  
            headers: obtenerHeaders(),
            body: JSON.stringify({
                estado: 'aceptado' // Verifica si tu DB espera 'aceptado' o 'realizado'
            })
        });

        if (res.ok) {
            alert("Estado actualizado a ACEPTADO ✅");
            cargarOrdenes();
            verDetalle(id);
        } else {
            alert("No se pudo actualizar el estado. Revisa los permisos.");
        }
    } catch (error) {
        alert("Error al conectar con el servidor.");
    }
}