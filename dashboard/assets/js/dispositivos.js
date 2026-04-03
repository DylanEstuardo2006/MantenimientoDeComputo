/*  =====================================
    CONFIGURACIÓN GENERAL 
=========================================
*/

if (!localStorage.getItem("token")) {
    window.location.replace("../login.html"); // .replace es mejor para que no puedan volver atrás
}

// ? URL de la API de Dispositivo

const urlApiDispositivos = "https://pratica-5b-node-s1hu.vercel.app/api/dispositivos";

// ? URL de la API de Laboratorios

const urlApiLaboratorios = "https://pratica-5b-node-s1hu.vercel.app/api/laboratorios";

// ? URL de la API de Tipo Dispositivo 
const urlApiTipoDispositivo = "https://pratica-5b-node-s1hu.vercel.app/api/tipo_dispositivo";

// ? URL de la API de Modelos 
const urlApiModelosSelect = "https://pratica-5b-node-s1hu.vercel.app/api/modelos";

let idDispositivoABorrar = null;

/**  =======================================
 * TODO: HEADERS CON TOKEN 
=========================================== */
function obtenerHeaders() {

    const token = localStorage.getItem("token");

    return {
        "Content-Type": "application/json",
        "Authorization": token ? `Bearer ${token}` : ""
    }
}

/**  ======================================================
  * TODO: FUNCIÓN PRINCIPAL DEL MÓDULO
====================================================== */

function inicializarModuloDispositivos(ruta) {


    const rutaLimpia = ruta.toLowerCase();

    /* ==============================
     * LISTAR DISPOSITIVOS
    ============================== */

    if (rutaLimpia.includes("dispositivos.html")) {

        listarDispositivos();

        configurarBuscadorDispositivos();

        const btnBorrar = document.getElementById("btnConfirmarBorrado");

        if (btnBorrar) {
            btnBorrar.onclick = confirmarBorradoDispositivoFinal;
        }
    }

    /** ==============================
        * TODO: CREAR DISPOSITIVO
       ============================== */
    if (rutaLimpia.includes("crear-dispositivos.html")) {

        renderizarSelectTipoDispositivo("selectTipoDispositivo");
        renderizarSelectModelos("selectModelos");
        renderizarSelectLaboratorios("selectLaboratorios");

        configurarFormularioCrearDispositivo();
    }

    /** ==============================
     * TODO: EDITAR DISPOSITIVO
    ============================== */

    if (rutaLimpia.includes("actualizar-dispositivos.html")) {

        const urlParams = new URLSearchParams(ruta.split("?")[1]);
        const idDispositivo = urlParams.get("idDispositivo");

        if (idDispositivo) {
            cargarDatosDispositivos(idDispositivo);

            const btnActualizar = document.getElementById("btnActualizarDispositivo");

            if (btnActualizar) {
                btnActualizar.onclick = function (e) {

                    e.preventDefault();
                    actualizarDispositivo(idDispositivo);
                }
            }
        }
    }
}

/** =================================
 * TODO: RENDERIZAR TIPO DISPOSITIVO
  ===================================
 */

function renderizarSelectTipoDispositivo(idSelect, idTipoDispositivoSelect = null) {

    const select = document.getElementById(idSelect);

    if (!select) return;

    fetch(urlApiTipoDispositivo, { headers: obtenerHeaders() })

        .then(res => res.json())

        .then(tipoDispositivo => {

            select.innerHTML = `<option disabled selected> Selecciones un Tipo de Dispositivo..... </option>`;

            tipoDispositivo.forEach(tipo => {

                const option = document.createElement("option");

                option.value = tipo.idTipoDispositivo;
                option.textContent = tipo.tipoDispositivo;

                if (idTipoDispositivoSelect && tipo.idTipoDispositivo == idTipoDispositivoSelect) {

                    option.selected = true;
                }

                select.appendChild(option);
            });
        })
        .catch(err => {
            console.error("Error cargando los Tipo de Dispositivo", err);
        });
}

/** =================================
 * TODO: RENDERIZAR LABORATORIOS
  ===================================
 */

function renderizarSelectLaboratorios(idSelect, idLaboratorioSeleccionado) {

    const select = document.getElementById(idSelect);

    if (!select) return;

    fetch(urlApiLaboratorios, { headers: obtenerHeaders() })

        .then(res => res.json())

        .then(laboratorios => {

            select.innerHTML = `<option disabled selected>Seleeciona un laboratorio... </option>`;

            laboratorios.forEach(lab => {

                const option = document.createElement("option");

                option.value = lab.idLaboratorio;
                option.textContent = lab.nombreLaboratorio;

                if (idLaboratorioSeleccionado && lab.idLaboratorio == idLaboratorioSeleccionado) {
                    option.selected = true;
                }

                select.appendChild(option);
            });
        })

        .catch(err => {
            console.error("Error cargando los laboratorios: ", err);
        })
}
/** =====================================
* TODO: RENDERIZAR MODELOS EN SELECT
================================== */
function renderizarSelectModelos(idSelect, idModeloSeleccionado = null) {
    const select = document.getElementById(idSelect);

    if (!select) return;

    fetch(urlApiModelosSelect, { headers: obtenerHeaders() })
        .then(res => res.json())
        .then(modelos => {


            select.innerHTML = `<option disabled selected>Seleccione un modelo...</option>`;

            modelos.forEach(modelo => {

                const option = document.createElement("option");

                option.value = modelo.idModelo;
                option.textContent = modelo.nombreModelo;

                if (idModeloSeleccionado && modelo.idModelo == idModeloSeleccionado) {
                    option.selected = true;
                }

                select.appendChild(option);
            });
        })
        .catch(err => {
            console.error("Error cargando los modelos", err);
        });
}
/** =====================================
* TODO: LISTAR DISPOSITIVOS
================================== */

function listarDispositivos() {

    fetch(urlApiDispositivos)
        .then(res => res.json())
        .then(data => {

            const tbody = document.getElementById("tabla-dispositivos");
            if (!tbody) return;

            let html = "";

            data.forEach(dispositivo => {
                html += `
                <tr>
                   <td>${dispositivo.idDispositivo}</td>
                   <td>${dispositivo.nombreDispositivo}</td>
                   <td>${dispositivo.numeroInventario}</td>
                   <td>${dispositivo.nombreModelo}</td>
                   <td>${dispositivo.nombreLaboratorio}</td>
                   <td>${dispositivo.tipoDispositivo}</td>
                   <td class="text-center">

                        <button id="btn-actualizar-dispositivo" class="btn btn-sm btn-outline-warning me-2"
                        onclick="cargarVista('views/actualizar-dispositivos.html?idDispositivo=${dispositivo.idDispositivo}')">
                        <i class="bi bi-pencil"></i>
                        </button>

                        <button id="btn-eliminar-dispositivo"class="btn btn-sm btn-outline-danger"
                        onclick="prepararEliminacionDispositivos(${dispositivo.idDispositivo},'${dispositivo.nombreDispositivo}')">
                        <i class="bi bi-trash"></i>
                        </button>
                    </td>
                 </tr>
               `;
            });

            tbody.innerHTML = html;
        })
        .catch(err => {
            console.error("Error al cargar los dispositivos:", err)
        })
}

/** ====================================
 * TODO: BUSCADOR DISPOSITIVO
======================================== */

function configurarBuscadorDispositivos() {

    const input = document.getElementById("inputBuscarDispositivo");
    const tabla = document.getElementById("tabla-dispositivos");

    if (!input || !tabla) return;

    input.addEventListener("keyup", function () {
        const valor = input.value.toLowerCase();
        const filas = tabla.getElementsByTagName("tr");

        Array.from(filas).forEach(fila => {
            const texto = fila
                .getElementsByTagName("td")[1]
                .textContent
                .toLowerCase();

            fila.style.display = texto.includes(valor) ? "" : "none";
        });
    })
}

/** ==================================
 * TODO: PREPARAR ELIMINACIÓN
====================================== */

window.prepararEliminacionDispositivos = function (id, nombre) {

    idDispositivoABorrar = id;

    const nombreElemento = document.getElementById("nombreDispositivoEliminar");

    if (nombreElemento) {
        nombreElemento.innerHTML = nombre;
    }
    const miModal = new bootstrap.Modal(
        document.getElementById("modalEliminarDispositivos")
    );

    miModal.show();
}

/** =====================================
 * TODO: CONFIRMAR BORRADO
 ======================================== */

function confirmarBorradoDispositivoFinal() {
    if (!idDispositivoABorrar) return;

    fetch(`${urlApiDispositivos}/${idDispositivoABorrar}`, {
        method: "DELETE",
        headers: obtenerHeaders()
    })
        .then(res => {
            if (!res.ok) {
                throw new Error("No se pudo eliminar el Dispositivo");
            }

            return res.json();
        })
        .then(() => {
            const modal = bootstrap.Modal.getInstance(
                document.getElementById("modalEliminarDispositivos")
            );

            if (modal) modal.hide();

            listarDispositivos();

            idDispositivoABorrar = null;

        })

        .catch(err => {
            console.error("Error al eliminar: ", err);
            alert("Error al eliminar dispositivo");
        });
}

/** ========================================
 * TODO: CARGAR DATOS PARA EDITAR 
============================================ */

function cargarDatosDispositivos(id) {
    fetch(`${urlApiDispositivos}/${id}`, { headers: obtenerHeaders() })

        .then(res => res.json())
        .then(dispositivo => {
            document.getElementById("editarNombreDispositivo").value = dispositivo.nombreDispositivo;
            document.getElementById("editarNumeroInventario").value = dispositivo.numeroInventario;

            renderizarSelectTipoDispositivo("selectTipoDispositivo", dispositivo.idTipoDispositivo);
            renderizarSelectModelos("selectModelos", dispositivo.idModelo);
            renderizarSelectLaboratorios("selectLaboratorios", dispositivo.idLaboratorio);
        })
        .catch(err => {
            console.error("Error cargando el dispositivo", err);
        })
}
/** =======================================
* TODO: FUNCIÓN ACTUALIZAR EL DISPOSITIVO
=========================================== */

function actualizarDispositivo(idDispositivo) {
    // ? Traemos los datos 

    const nombreDispositivo = document.getElementById("editarNombreDispositivo").value.trim();
    const numeroInventario = document.getElementById("editarNumeroInventario").value.trim();
    const idLaboratorio = parseInt(document.getElementById("selectLaboratorios").value);
    const idTipoDispositivo = parseInt(document.getElementById("selectTipoDispositivo").value);
    const idModelo = parseInt(document.getElementById("selectModelos").value);

    if (!nombreDispositivo) {
        alert("❌ El nombre no puede estar vacio");
        return;
    }

    const soloNumeros = /^\d+$/.exec(numeroInventario);

    if (!soloNumeros) {
        alert("❌ El número de inventario debe contener números.");
        return; // Detiene la ejecución
    }

    if (numeroInventario.length !== 11) {
        alert("❌ La matrícula debe tener exactamente 11 caracteres. (Tienes: " + numeroInventario.length + ")")
        return;
    }

    if (isNaN(idTipoDispositivo) || idTipoDispositivo <= 0) {
        alert("⚠️ Seguridad: El tipo de dispositivo seleccionado no es válido.");
        return;
    }

    if (isNaN(idLaboratorio) || idLaboratorio <= 0) {
        alert("⚠️ Seguridad: El laboratorio seleccionado no es válido.");
        return;
    }

    if (isNaN(idModelo) || idModelo <= 0) {
        alert("⚠️ Seguridad: El modelo seleccionado no es válido.");
        return;
    }

    const dispositivoActualizado = {
        nombreDispositivo: nombreDispositivo,
        numeroInventario: numeroInventario,
        idTipoDispositivo: idTipoDispositivo,
        idLaboratorio: idLaboratorio,
        idModelo: idModelo
    };

    fetch(`${urlApiDispositivos}/${idDispositivo}`, {
        method: "PUT",
        headers: obtenerHeaders(),
        body: JSON.stringify(dispositivoActualizado)
    })
        .then(res => {
            if (!res.ok) {
                throw new Error("No se pudo actualizar el dispositivo");
            }

            return res.json();
        })

        .then(() => {
            alert("Dispositivo actualizado correctamente");

            cargarVista("views/dispositivos.html");
        })
        .catch(err => {
            console.error("Error: ", err);

            alert("Error al actualizar el dispositivo");
        })
}

/**  =================================
 *  TODO: CONFIGURAR FORMULARIO CREAR
====================================== */

function configurarFormularioCrearDispositivo() {

    const btnGuardar = document.getElementById("btnGuardarDispositivo");

    if (btnGuardar) {
        btnGuardar.onclick = function (e) {
            e.preventDefault();
            guardarNuevoDispositivo();
        }
    }
}

/**  =================================
 *  TODO: CREAR NUEVO DISPOSITIVO
====================================== */

function guardarNuevoDispositivo() {

    // ? Traemos los datos 

    const nombreDispositivo = document.getElementById("editarNombreDispositivo").value.trim();
    const numeroInventario = document.getElementById("editarNumeroInventario").value.trim();
    const idLaboratorio = parseInt(document.getElementById("selectLaboratorios").value);
    const idTipoDispositivo = parseInt(document.getElementById("selectTipoDispositivo").value);
    const idModelo = parseInt(document.getElementById("selectModelos").value);


    if (nombreDispositivo === "") {
        alert("❌ El nombre del dispositivo no puede estar vacío.");
        return;
    }
    // Estos son los caracteres que quieres prohibir
    const caracteresProhibidos = /[ ,()\-}[\]+´’¿|#$%&/^]/;

    // .test() es más limpio para validaciones booleanas que .exec()
    if (caracteresProhibidos.test(nombreDispositivo)) {
        alert("❌ El nombre del dispositivo contiene caracteres no permitidos.");
        return;
    }

    const soloNumeros = /^\d+$/.exec(numeroInventario);

    if (!soloNumeros) {
        alert("❌ El número de inventario debe contener números.");
        return; // Detiene la ejecución
    }

    if (numeroInventario.length !== 11) {
        alert("❌ La matrícula debe tener exactamente 11 caracteres. (Tienes: " + numeroInventario.length + ")")
        return;
    }

    if (isNaN(idTipoDispositivo) || idTipoDispositivo <= 0) {
        alert("⚠️ Seguridad: El tipo de dispositivo seleccionado no es válido.");
        return;
    }

    if (isNaN(idLaboratorio) || idLaboratorio <= 0) {
        alert("⚠️ Seguridad: El laboratorio seleccionado no es válido.");
        return;
    }

    if (isNaN(idModelo) || idModelo <= 0) {
        alert("⚠️ Seguridad: El nodelo seleccionado no es válido.");
        return;
    }

    const nuevoDispositivo = {
        nombreDispositivo: nombreDispositivo,
        numeroInventario: numeroInventario,
        idTipoDispositivo: idTipoDispositivo,
        idLaboratorio: idLaboratorio,
        idModelo: idModelo
    };

    fetch(urlApiDispositivos, {
        method: "POST",
        headers: obtenerHeaders(),
        body: JSON.stringify(nuevoDispositivo)
    })
        .then(res => {
            if (!res.ok) {
                throw new Error("Error al crear Dispositivo")
            }
            return res.json();
        })

        .then(() => {

            alert("Dispositivo creado correctamente");

            cargarVista("views/dispositivos.html");

        })

        .catch(err => {

            console.error("Error:", err);

            alert("No se pudo crear el dispositivo");

        });

}