/* =====================================================
     CONFIGURACIÓN GENERAL DEL MÓDULO 
===================================================== */

// URL de la API de usuarios 

const urlApiUsuarios = "https://pratica-5b-node-s1hu.vercel.app/api/usuarios";

// URL de la API de roles (se usa para llenar el select)

const urlApiRoles = "https://pratica-5b-node-s1hu.vercel.app/api/roles";

// Variable global para guardar el ID del usuario que se requiere eliminar 

let idUsuarioABorrar = null;

// ==========================================
// FUNCIÓN PARA OBTENER HEADER DE LAS PETICIONES 
// ==========================================

function obtenerHeaders() {
    //Aquí podriamos obtener un token si existiera
    //const token = localStorage.getItem("token");

    return {
        "Content-Type": "application/json"
        // "Authorization": "Bearer " + token
    };
}

/* =========================================================
    FUNCIÓN PRINCIPAL DEL MÓDULO
    Se ejecuta cada vez que se carga una vista relacionada 
    con USUARIOS desde el dashboard.
============================================================ */

function inicializarModuloUsuarios(ruta) {
    console.log("Inicializando Interfaz de usuarios....");

    /* --------------------
    VISTA: LISTAR USUARIOS
    --------------------- */

    if (ruta.includes("usuarios.html")) {
        listarUsuarios(); // cargar la tabla

        configurarBuscadorUsuarios(); // activa el buscador


        // Botón del modal de eliminación

        const btnBorrar = document.getElementById("btnConfirmarBorrado");

        if (btnBorrar) {
            btnBorrar.onclick = confirmarBorradoUsuarioFinal;
        }
    }
    /* ---------------------------------
     VISTA: EDITAR USUARIO 
    ---------------------------------- */
    else if (ruta.includes("actualizar-usuario.html")) {
        // Ontenemos el ID que viene en la URL 

        const urlParams = new URLSearchParams(ruta.split("?")[1]);

        const idUsuarioAEditar = urlParams.get("idUsuario");

        if (idUsuarioAEditar) {
            // Cargamos los datos en el formulario 
            cargarDatosEnFormularioUsuarios(idUsuarioAEditar);
        }
    }

    /* -------------------------
      VISTA: CREAR USUARIO
   --------------------------*/

    else if (ruta.includes("crear-usuario.html")) {

        const select = document.getElementById("selectRoles");

        if (select) {

            // cargamos el select sin marca seleccionada
            renderizarSelectMarcas("selectRoles");
        }
    }
}

/* ========================================= 
FUNCIÓN: RENDERIZAR SELECT DE ROLES
Se usa tanto en CREAR como en ACTUALIZAR 
=========================================== */

function renderizarSelectRoles(idSelect, idRolSeleccionado = null) {
    const select = document.getElementById(idSelect);

    if (!select) return;

    select.innerHTML = '<option value="">Cargando Roles...</option>';

    fetch(urlApiRoles, { headers: obtenerHeaders() })

        .then(res => res.json())

        .then(roles => {
            select.innerHTML =
                '<option value="" selected disabled>Seleccione un Rol...</option>';

            roles.forEach(roles => {

                const option = document.createElement("option");

                option.value = roles.idRol;

                //Si estamos en editar, marcamos la opción correcta 
                if (
                    idRolSeleccionado !== null &&
                    String(roles.idRol) === String(idRolSeleccionado)
                ) {
                    option.selected = true;
                }

                select.appendChild(option);
            });
        })

        .catch(err => {
            console.error("Error al cargar roles:", err);
            select.innerHTML = '<option value=""> Error al cargar </option>';
        });
}
/* ===========================================
    FUNCIÓN: LISTAR USUARIOS EN LA TABLA 
=============================================  */

function listarUsuarios() {
    fetch(urlApiUsuarios)

        .then(res => res.json())

        .then(data => {
            const tbody = document.getElementById("tabla-usuarios");

            if (!tbody) return;

            let html = "";


            data.forEach(usuarios => {
       

                html += `
               <tr>
                   <td>${usuarios.idUsuario}</td>
                   <td>${usuarios.nombreUsuario}</td>
                   <td>${usuarios.apellidoPaterno}</td>
                   <td>${usuarios.apellidoMaterno}</td>
                   <td>${usuarios.matricula}</td>  
                   <td><span class="badge bg-primary">${usuarios.idRol}</span></td>
                   <td class="text-center">

                  <button class="btn btn-sm btn-outline-warning me-2" onclick="cargarVista('views/actualizar-usuario.html?idUsuario=${usuarios.idUsuario}')">
                  <i class="bi bi-pencil"></i>
                  </button>

                  <button class="btn btn-sm btn-outline-danger"
                   onclick="prepararEliminacionUsuarios(${usuarios.idUsuario},'${usuarios.nombreUsuario}')" 
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

function configurarBuscadorUsuarios() {
    const input = document.getElementById("inputBuscarUsuario");

    const tabla = document.getElementById("tabla-usuarios");

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
            }
            else {
                fila.style.display = "none";
            }

        });
    });
}

/* ======================================================
   FUNCIÓN: PREPARAR ELIMINACIÓN
   Abre el modal y guarda el ID
====================================================== */

window.prepararEliminacionUsuarios = function (id, nombre) {
    idUsuarioABorrar = id;

    const nombreElemento = document.getElementById("nombreUsuarioEliminar");

    if (nombreElemento) {
         nombreElemento.innerHTML = nombre;
    }
    
    const miModal = new bootstrap.miModal(
         document.getElementById("modalEliminarUsuarios")
    );

    miModal.show()
}

/* ======================================================
   FUNCIÓN: CONFIRMAR BORRADO FINAL
   Se ejecuta cuando el usuario confirma eliminar
====================================================== */


function confirmarBorradoUsuarioFinal() {

    // Verificamos que exista un ID guardado
    if (!idUsuarioABorrar) return;

    fetch(`${urlApiUsuarios}/${idUsuarioABorrar}`, {
        method: "DELETE",
        headers: obtenerHeaders()
    })
    .then(res => {

        if (!res.ok) {
            throw new Error("No se pudo eliminar el usuario");
        }

        return res.json();
    })
    .then(() => {

        // Cerramos el modal
        const modal = bootstrap.Modal.getInstance(
            document.getElementById("modalEliminarMarca")
        );

        if (modal) modal.hide();

        // Recargamos la lista
        listarModelos();

        // Limpiamos el ID
        idUsuarioABorrar = null;

    })
    .catch(err => {
        console.error("Error al eliminar:", err);
        alert("Error al eliminar el usuario");
    });

}


/* ======================================================
   FUNCIÓN: CARGAR DATOS EN FORMULARIO (EDITAR)
====================================================== */

function cargarDatosEnFormularioModelos(id) {

    fetch(`${urlApiUsuarios}/${id}`, { headers: obtenerHeaders() })

        .then(res => res.json())

        .then(modelo => {

            const inputNombre = document.getElementById("editarNombreUsuario");
            const inputApellidoP = document.getElementById("editarApellidoPaterno");

            
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