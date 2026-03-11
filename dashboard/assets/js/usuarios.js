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
    const token = localStorage.getItem("token");

    return {
        "Content-Type": "application/json",
        "Authorization": token ? `Bearer ${token}` : ""
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

    if (ruta.includes("usuario.html")) {
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
            renderizarSelectRoles("selectRoles");
        }
        const btnToggle = document.getElementById('btnTogglePassword');
        const inputPass = document.getElementById('nuevoPassword');
        const icono = document.getElementById('iconoOjito');

        if (btnToggle && inputPass) {
            btnToggle.addEventListener('click', function () {
                // Cambiamos el tipo de input
                const tipo = inputPass.getAttribute('type') === 'password' ? 'text' : 'password';
                inputPass.setAttribute('type', tipo);

                // Cambiamos el icono (ojo / ojo tachado)
                icono.classList.toggle('bi-eye');
                icono.classList.toggle('bi-eye-slash');
            });
        }
        // --- AGREGAR ESTO ---
        const btnGuardar = document.getElementById("btnGuardarUsuario");
        if (btnGuardar) {
            btnGuardar.onclick = function (e) {
                e.preventDefault(); // Evita que la página se recargue
                guardarNuevoUsuario();
            };
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

            roles.forEach(rol => {

                const option = document.createElement("option");

                option.value = rol.idRol;

                option.textContent = rol.rol || rol.rol;

                //Si estamos en editar, marcamos la opción correcta 
                if (
                    idRolSeleccionado !== null &&
                    String(rol.idRol) === String(idRolSeleccionado)
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
                   <td>${usuarios.telefono}</td> 

                   <td><span class="badge bg-primary">${usuarios.rol}</span></td>
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

function cargarDatosEnFormularioUsuarios(id) {

    fetch(`${urlApiUsuarios}/${id}`, { headers: obtenerHeaders() })

        .then(res => res.json())

        .then(usuarios => {

            const inputNombre = document.getElementById("editarNombreUsuario");
            const inputApellidoP = document.getElementById("editarApellidoPaterno");
            const inputApellidoM = document.getElementById("editarApellidoMaterno");
            const inputMatricula = document.getElementById("editarMatricula");
            const inputTelefono = document.getElementById("editarTelefono");


            if (inputNombre) inputNombre.value = usuarios.nombreUsuario;
            if (inputApellidoP) inputApellidoP.value = usuarios.apellidoPaterno;
            if (inputApellidoM) inputApellidoM.value = usuarios.apellidoMaterno;
            if (inputMatricula) inputMatricula.value = usuarios.matricula;
            if (inputTelefono) inputTelefono.value = usuarios.telefono;

            // cargamos el select con la marca ya seleccionada
            renderizarSelectRoles("selectRoles", usuarios.idRol);

        })

        .catch(err => {

            console.error("Error al cargar datos:", err);

        });

}

/* ======================================================
    FUNCIÓN: CREAR NUEVO USUARIO
====================================================== */
function guardarNuevoUsuario() {
    // 1. Capturamos los valores de los inputs (asegúrate de que los IDs coincidan con tu HTML)
    const nombre = document.getElementById("nuevoNombre")?.value;
    const apellidoP = document.getElementById("nuevoApellidoP")?.value;
    const apellidoM = document.getElementById("nuevoApellidoM")?.value;
    const matricula = document.getElementById("nuevaMatricula")?.value;
    const telefono = document.getElementById("nuevoTelefono")?.value;
    const idRol = document.getElementById("selectRoles")?.value;
    const password = document.getElementById("nuevoPassword")?.value;

    // Validación simple
    if (!nombre || !apellidoP || !apellidoM || !matricula || !idRol || !password || !telefono) {
        alert("Por favor, completa los campos. Todos son obligatorios)");
        return;
    }

    const nuevoUsuario = {
        nombreUsuario: nombre,
        apellidoPaterno: apellidoP,
        apellidoMaterno: apellidoM,
        matricula: matricula,
        telefono: telefono,
        idRol: parseInt(idRol),
        contrasena: password // Tu API debería hashear esto al recibirlo
    };

    fetch(urlApiUsuarios, {
        method: "POST",
        headers: obtenerHeaders(),
        body: JSON.stringify(nuevoUsuario)
    })
        .then(res => {
            if (!res.ok) throw new Error("Error al crear el usuario");
            return res.json();
        })
        .then(data => {
            alert("¡Usuario creado con éxito!");
            // Regresamos a la lista de usuarios
            cargarVista('views/usuario.html');
        })
        .catch(err => {
            console.error("Error:", err);
            alert("No se pudo crear el usuario. Revisa la consola.");
        });
}