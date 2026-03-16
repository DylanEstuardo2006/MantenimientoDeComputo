/* ======================================================
   CONFIGURACIÓN GENERAL DEL MÓDULO
====================================================== */

// URL de la API de modelos
const urlApiModelos = "https://pratica-5b-node-s1hu.vercel.app/api/modelos";

// URL de la API de marcas (se usa para llenar el select)
const urlApiMarcas = "https://pratica-5b-node-s1hu.vercel.app/api/marcas";

// Variable global para guardar el ID del modelo que se quiere eliminar
let idModeloABorrar = null;


// ==========================================
// FUNCION PARA OBTENER HEADERS DE LAS PETICIONES
// ==========================================
function obtenerHeaders() {

    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        "Authorization": token ? `Bearer ${token}` : ""
    };
}


/* ======================================================
   FUNCIÓN PRINCIPAL DEL MÓDULO
   Se ejecuta cada vez que se carga una vista relacionada
   con MODELOS desde el dashboard.
====================================================== */

function inicializarModuloModelos(ruta) {

    const rutaLimpia = ruta.toLowerCase();
    console.log("Inicializando interfaz de modelos...");

    /* -------------------------
       VISTA: LISTAR MODELOS
    --------------------------*/

    if (rutaLimpia.includes("modelos.html")) {

        listarModelos(); // carga la tabla

        configurarBuscadorModelos(); // activa el buscador

        // botón del modal de eliminación
        const btnBorrar = document.getElementById("btnConfirmarBorrado");

        if (btnBorrar) {
            btnBorrar.onclick = confirmarBorradoModelosFinal;
        }
    }

    /* -------------------------
       VISTA: CREAR MODELO
    --------------------------*/

    if (rutaLimpia.includes("crear-modelo.html")) {
        // cargamos el select sin marca seleccionada
        renderizarSelectMarcas("selectMarca");
        configurarFormularioCrearModelos();

    }

    /* -------------------------
       VISTA: EDITAR MODELO
    --------------------------*/

    if (rutaLimpia.includes("actualizar-modelo.html")) {

        // Obtenemos el ID que viene en la URL
        const urlParams = new URLSearchParams(ruta.split("?")[1]);

        const idModeloAEditar = urlParams.get("idModelo");

        if (idModeloAEditar) {

            // cargamos los datos en el formulario
            cargarDatosEnFormularioModelos(idModeloAEditar);

            const btnActualizar = document.getElementById("btnActualizarModelos");

            if (btnActualizar) {
                btnActualizar.onclick = function (e) {
                    e.preventDefault();
                    actualizarModelo(idModeloAEditar);
                }
            }

        }
    }


}


/* ======================================================
   FUNCIÓN: RENDERIZAR SELECT DE MARCAS
   Se usa tanto en CREAR como en ACTUALIZAR
====================================================== */

function renderizarSelectMarcas(idSelect, idMarcaSeleccionada = null) {

    const select = document.getElementById(idSelect);

    if (!select) return;

    // mensaje mientras carga
    select.innerHTML = '<option value="">Cargando marcas...</option>';

    fetch(urlApiMarcas, { headers: obtenerHeaders() })

        .then(res => res.json())

        .then(marcas => {

            select.innerHTML =
                '<option value="" selected disabled>Seleccione una marca...</option>';

            marcas.forEach(marca => {

                const option = document.createElement("option");

                option.value = marca.idMarca;

                option.textContent = marca.nombreMarca;

                // Si estamos en editar, marcamos la opción correcta
                if (
                    idMarcaSeleccionada !== null &&
                    String(marca.idMarca) === String(idMarcaSeleccionada)
                ) {
                    option.selected = true;
                }

                select.appendChild(option);

            });
        })

        .catch(err => {

            console.error("Error al cargar marcas:", err);

            select.innerHTML = '<option value="">Error al cargar</option>';

        });

}


/* ======================================================
   FUNCIÓN: LISTAR MODELOS EN LA TABLA
====================================================== */

function listarModelos() {

    fetch(urlApiModelos)

        .then(res => res.json())

        .then(data => {

            const tbody = document.getElementById("tabla-modelos");

            if (!tbody) return;

            let html = "";

            data.forEach(modelo => {

                html += `
                <tr>

                    <td>${modelo.idModelo}</td>

                    <td>${modelo.nombreModelo}</td>

                    <td>${modelo.idMarca}</td>

                    <td>${modelo.nombreMarca}</td>

                    <td class="text-center">

                        <!-- BOTÓN EDITAR -->
                        <button id ="btn-editar-modelos"
                            class="btn btn-sm btn-outline-warning me-2"
                            onclick="cargarVista('views/actualizar-modelo.html?idModelo=${modelo.idModelo}')"
                        >
                            <i class="bi bi-pencil"></i>
                        </button>

                        <!-- BOTÓN ELIMINAR -->
                        <button id = "btn-eliminar-modelos"
                            class="btn btn-sm btn-outline-danger"
                            onclick="prepararEliminacionModelos(${modelo.idModelo}, '${modelo.nombreModelo}')"
                        >
                            <i class="bi bi-trash"></i>
                        </button>

                    </td>

                </tr>
                `;
            });

            tbody.innerHTML = html;

        })

        .catch(err => {

            console.error("Error al cargar modelos:", err);

        });
}


/* ======================================================
   FUNCIÓN: BUSCADOR DE MODELOS
   Filtra los resultados en la tabla
====================================================== */

function configurarBuscadorModelos() {

    const input = document.getElementById("inputBuscarModelos");

    const tabla = document.getElementById("tabla-modelos");

    if (!input || !tabla) return;

    input.addEventListener("keyup", function () {

        const valor = input.value.toLowerCase();

        const filas = tabla.getElementsByTagName("tr");

        Array.from(filas).forEach(fila => {

            const texto = fila
                .getElementsByTagName("td")[1]
                .textContent.toLowerCase();

            if (texto.includes(valor)) {

                fila.style.display = "";

            } else {

                fila.style.display = "none";

            }

        });

    });

}


/* ======================================================
   FUNCIÓN: PREPARAR ELIMINACIÓN
   Abre el modal y guarda el ID
====================================================== */

window.prepararEliminacionModelos = function (id, nombre) {

    idModeloABorrar = id;

    const nombreElemento = document.getElementById("nombreModeloEliminar");

    if (nombreElemento) {
        nombreElemento.innerText = nombre;
    }

    const miModal = new bootstrap.Modal(
        document.getElementById("modalEliminarModelos")
    );

    miModal.show();

};

/* ======================================================
   FUNCIÓN: CONFIRMAR BORRADO FINAL
   Se ejecuta cuando el usuario confirma eliminar
====================================================== */

function confirmarBorradoModelosFinal() {

    // Verificamos que exista un ID guardado
    if (!idModeloABorrar) return;

    fetch(`${urlApiModelos}/${idModeloABorrar}`, 
    {
        method: 'DELETE',
        headers: obtenerHeaders() })
        .then(res => {

            if (!res.ok) {
                return res.text().then(text => {
                    throw new Error(text);
                });
            }
            return res.json();
        })
        .then(() => {

            // Cerramos el modal
            const modal = bootstrap.Modal.getInstance(
                document.getElementById("modalEliminarModelos")
            );

            if (modal) modal.hide();

            // Recargamos la lista
            listarModelos();

            // Limpiamos el ID
            idModeloABorrar = null;

        })
        .catch(err => {
            console.error("Error al eliminar:", err);
            alert("Error al eliminar el modelo");
        });

}


/* ======================================================
   FUNCIÓN: CARGAR DATOS EN FORMULARIO (EDITAR)
====================================================== */

function cargarDatosEnFormularioModelos(id) {

    fetch(`${urlApiModelos}/${id}`, { headers: obtenerHeaders() })

        .then(res => res.json())

        .then(modelo => {

            const input = document.getElementById("editNombreModelo");

            const displayId = document.getElementById("displayIdModelo");

            if (input) input.value = modelo.nombreModelo;

            if (displayId) displayId.innerText = modelo.idModelo;

            // cargamos el select con la marca ya seleccionada
            renderizarSelectMarcas("selectMarca", modelo.idMarca);

        })

        .catch(err => {

            console.error("Error al cargar datos:", err);

        });

}
/* ========================================
  FUNCIÓN ACTUALIZAR EL MODELO
  ======================================== */
function actualizarModelo(idModelo) {
    const nombreModelo = document.getElementById("editNombreModelo").value.trim();
    const idMarca = parseInt(document.getElementById("selectMarca").value);


    if (!nombreModelo) {
        alert("❌ El modelo no puede estar vacio");
    }

    if (isNaN(idMarca) || idMarca <= 0) {
        alert("⚠️ Seguridad: La marca seleccionada no es válido.")
    }
    const modeloActualizado = {
        nombreModelo: nombreModelo,
        idMarca: idMarca
    }
    fetch(`${urlApiModelos}/${idModelo}`, {
        method: "PUT",
        headers: obtenerHeaders(),
        body: JSON.stringify(modeloActualizado)
    })
        .then(res => {
            if (!res.ok) {
                throw new Error("No se pudo actualizar el modelo");
            }

            return res.json();

        })
        .then(() => {
            alert("Modelo actualizado correctamente");
            cargarVista("views/modelos.html");
        })
        .catch(err => {
            console.error("Error: ", err);

            alert("Error al actualizar el modelo");
        });
}


/* =======================================
  FUNCIÓN: CONFIGURAR FORMULARIO CREAR
=========================================== */

function configurarFormularioCrearModelos() {

    const btnGuardar = document.getElementById("btnGuardarModelo");
    /* BOTÓN GUARDAR */
    if (btnGuardar) {
        btnGuardar.onclick = function (e) {
            e.preventDefault();
            guardarNuevoModelo();
        }
    }

}

/* =================================
  CREAR NUEVO MODELO 
  ================================= */
function guardarNuevoModelo() {

    const nombreModelo = document.getElementById("nuevoNombreModelo").value.trim();
    const idMarca = parseInt(document.getElementById("selectMarca").value);

    if (!nombreModelo) {
        alert("❌ El modelo no puede estar vacio");
        return;
    }
    // Validación de Marcas
    if (isNaN(idMarca) || idMarca <= 0) {
        alert("⚠️ Seguridad: La marca seleccionada no es valida.");
        return;
    }

    const nuevoModelo = {
        nombreModelo: nombreModelo,
        idMarca: idMarca
    }

    fetch(urlApiModelos, {
        method: "POST",
        headers: obtenerHeaders(),
        body: JSON.stringify(nuevoModelo)
    })
        .then(res => {
            if (!res.ok) {
                throw new Error("Error al crear modelo");
            }

            return res.json();
        })
        .then(() => {
            alert("Modelo creado correctamente");

            cargarVista("views/modelos.html");
        })
        .catch(err => {
            console.error("Error:", err);

            alert("No se pudo crear el modelo");
        })
}