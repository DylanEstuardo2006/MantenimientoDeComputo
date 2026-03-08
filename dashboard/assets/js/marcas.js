// ============================================================
//  marcas.js  –  CRUD completo para el módulo de Marcas
// ============================================================

const urlMarcas = 'https://pratica-5b-node-s1hu.vercel.app/api/marcas';

// Variables de estado del módulo
let idMarcaABorrar = null;
let idMarcaAEditar = null;


// ─────────────────────────────────────────────
//  INICIALIZADOR  (llamado desde el router)
// ─────────────────────────────────────────────
function inicializarModuloMarcas(ruta) {
    console.log("Módulo de Marcas activado:", ruta);

    if (ruta.includes('actualizar-marcas.html')) {
        const query = ruta.includes('?') ? ruta.split('?')[1] : '';
        const params = new URLSearchParams(query);
        idMarcaAEditar = params.get('idMarca');

        if (idMarcaAEditar) {
            console.log("Editando marca ID:", idMarcaAEditar);
            cargarDatosMarcaEnFormulario(idMarcaAEditar);
        } else {
            console.warn("No se recibió idMarca en la URL.");
        }

    } else if (ruta.includes('crear-marca.html')) {
        const form = document.getElementById('formCrearMarca');
        if (form) form.addEventListener('submit', guardarNuevaMarca);

    } else if (ruta.includes('marcas.html')) {
        listarMarcas();
        const btnBorrar = document.getElementById('btnConfirmarBorrado');
        if (btnBorrar) btnBorrar.onclick = confirmarBorradoFinal;
    }
}


// ─────────────────────────────────────────────
//  LISTAR
// ─────────────────────────────────────────────
function listarMarcas() {
    fetch(urlMarcas)
        .then(res => res.json())
        .then(data => {
            const tbody = document.getElementById('tabla-marcas');
            if (!tbody) return;

            tbody.innerHTML = '';

            data.forEach(marca => {
                tbody.innerHTML += `
                  <tr>
                    <td>${marca.idMarca}</td>
                    <td>${marca.nombreMarca}</td>
                    <td class="text-center">
                        <button class="btn btn-sm btn-outline-warning me-2"
                                onclick="cargarVista('views/actualizar-marcas.html?idMarca=${marca.idMarca}')">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger"
                                onclick="prepararEliminacion(${marca.idMarca}, '${marca.nombreMarca}')">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                  </tr>`;
            });

            // El buscador se configura DESPUÉS de poblar la tabla
            configurarBuscadorMarcas();
        })
        .catch(err => console.error("Error al obtener marcas:", err));
}


// ─────────────────────────────────────────────
//  BUSCADOR (filtro frontend)
// ─────────────────────────────────────────────
function configurarBuscadorMarcas() {
    const input = document.getElementById('inputBuscarMarca');
    const tbody = document.getElementById('tabla-marcas');
    if (!input || !tbody) return;

    // Elimina listeners anteriores clonando el nodo
    const nuevoInput = input.cloneNode(true);
    input.parentNode.replaceChild(nuevoInput, input);

    nuevoInput.addEventListener('keyup', function () {
        const valor = nuevoInput.value.toLowerCase().trim();

        Array.from(tbody.getElementsByTagName('tr')).forEach(fila => {
            const celda = fila.getElementsByTagName('td')[1]; // columna Nombre
            if (!celda) return;
            fila.style.display = celda.textContent.toLowerCase().includes(valor) ? '' : 'none';
        });
    });
}


// ─────────────────────────────────────────────
//  CREAR
// ─────────────────────────────────────────────
window.guardarNuevaMarca = function (event) {
    event.preventDefault();

    const nombreMarca = document.getElementById('nombreMarca')?.value.trim();
    if (!nombreMarca) {
        alert("El nombre no puede estar vacío.");
        return;
    }

    fetch(urlMarcas, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombreMarca })
    })
        .then(res => {
            if (res.ok) {
                console.log("Marca creada con éxito.");
                cargarVista('views/marcas.html');
            } else {
                alert("Error al crear la marca en el servidor.");
            }
        })
        .catch(err => {
            console.error("Error en la petición POST:", err);
            alert("No se pudo conectar con el servidor.");
        });
};


// ─────────────────────────────────────────────
//  CARGAR DATOS EN FORMULARIO (edición)
// ─────────────────────────────────────────────
window.cargarDatosMarcaEnFormulario = function(id) {
    console.log(">>> entrando a cargarDatosEnFormulario, id:", id);
    fetch(`${urlMarcas}/${id}`)
        .then(res => res.json())
        .then(marca => {
            console.log(">>> marca recibida:", marca);
            const input = document.getElementById('nombreMarca');
            console.log(">>> input:", input);
            if (input) input.value = marca.nombreMarca ?? '';
        })
        .catch(err => console.error(">>> Error:", err));
}

// ─────────────────────────────────────────────
//  ACTUALIZAR
// ─────────────────────────────────────────────
window.guardarActualizacionMarca = function (event) {
    event.preventDefault();

    const nombreMarca = document.getElementById('nombreMarca')?.value.trim();
    if (!nombreMarca) {
        alert("El nombre no puede estar vacío.");
        return;
    }

    fetch(`${urlMarcas}/${idMarcaAEditar}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombreMarca })
    })
        .then(res => {
            if (res.ok) {
                console.log("Marca actualizada con éxito.");
                cargarVista('views/marcas.html');
            } else {
                alert("Error al actualizar en el servidor.");
            }
        })
        .catch(err => {
            console.error("Error en la petición PUT:", err);
            alert("No se pudo conectar con el servidor.");
        });
};


// ─────────────────────────────────────────────
//  ELIMINAR
// ─────────────────────────────────────────────
window.prepararEliminacion = function (id, nombre) {
    idMarcaABorrar = id;
    const span = document.getElementById('nombreMarcaEliminar');
    if (span) span.innerText = nombre;

    const miModal = new bootstrap.Modal(document.getElementById('modalEliminar'));
    miModal.show();
};

window.confirmarBorradoFinal = function () {
    if (!idMarcaABorrar) return;

    fetch(`${urlMarcas}/${idMarcaABorrar}`, { method: 'DELETE' })
        .then(res => {
            if (res.ok) {
                const modal = bootstrap.Modal.getInstance(document.getElementById('modalEliminar'));
                modal?.hide();
                idMarcaABorrar = null;
                listarMarcas();
            } else {
                alert("Error al eliminar la marca.");
            }
        })
        .catch(err => {
            console.error("Error en la petición DELETE:", err);
            alert("No se pudo conectar con el servidor.");
        });
};
