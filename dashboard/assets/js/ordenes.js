/* ======================================================
   CONFIGURACIÓN GENERAL
====================================================== */
if (!localStorage.getItem("token")) {
    window.location.replace("../login.html"); // .replace es mejor para que no puedan volver atrás
}

const urlApiOrdenes = "https://pratica-5b-node-s1hu.vercel.app/api";

const urlApiOrdenesDetails = "https://pratica-5b-node-s1hu.vercel.app/api";
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

async function cargarLaboratorios() {

    const res = await fetch("https://pratica-5b-node-s1hu.vercel.app/api/laboratorios");
    const labs = await res.json();

    const select = document.getElementById("labSelect");

    select.innerHTML = `<option value="">Selecciona...</option>`;

    labs.forEach(l => {
        select.innerHTML += `<option value="${l.idLaboratorio}">${l.nombreLaboratorio}</option>`;
    });
}

document.addEventListener("change", async (e) => {

    if (e.target.id === "labSelect") {

        const idLab = e.target.value;

        const res = await fetch(`TU_API/dispositivos/laboratorio/${idLab}`);
        const dispositivos = await res.json();

        const cont = document.getElementById("listaDispositivos");

        cont.innerHTML = "";

        dispositivos.forEach(d => {
            cont.innerHTML += `
        <div>
        <input type="checkbox" value="${d.idDispositivo}">
        ${d.nombreDispositivo}
        </div>
      `;
        });
    }

});