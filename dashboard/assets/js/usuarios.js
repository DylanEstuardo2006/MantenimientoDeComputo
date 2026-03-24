/* ======================================================
   CONFIGURACIÓN GENERAL
====================================================== */
if (!localStorage.getItem("token")) {
    window.location.replace("../login.html"); // .replace es mejor para que no puedan volver atrás
}

const urlApiUsuarios = "https://pratica-5b-node-s1hu.vercel.app/api/usuarios";
const urlApiRoles = "https://pratica-5b-node-s1hu.vercel.app/api/roles";

let idUsuarioABorrar = null;

/** ======================================================
  * TODO: HEADERS CON TOKEN
============================================= */

function obtenerHeaders() {

    const token = localStorage.getItem("token");

    return {
        "Content-Type": "application/json",
        "Authorization": token ? `Bearer ${token}` : ""
    };
}

/**  ======================================================
  * TODO: FUNCIÓN PRINCIPAL DEL MÓDULO
====================================================== */

function inicializarModuloUsuarios(ruta) {

    const rutaLimpia = ruta.toLowerCase();

    /* ==============================
     * LISTAR USUARIOS
    ============================== */

    if (rutaLimpia.includes("usuario.html")) {

        listarUsuarios();
        configurarBuscadorUsuarios();

        const btnBorrar = document.getElementById("btnConfirmarBorrado");

        if (btnBorrar) {
            btnBorrar.onclick = confirmarBorradoUsuarioFinal;
        }
    }

    /** ==============================
     * TODO:  CREAR USUARIO
    ============================== */

    if (rutaLimpia.includes("crear-usuario.html")) {

        renderizarSelectRoles("selectRoles");
        configurarFormularioCrearUsuario();
    }

    /* ==============================
   EDITAR USUARIO
============================== */

    if (rutaLimpia.includes("actualizar-usuario.html")) {

        const urlParams = new URLSearchParams(ruta.split("?")[1]);
        const idUsuario = urlParams.get("idUsuario");

        if (idUsuario) {

            cargarDatosUsuario(idUsuario);

            const btnActualizar = document.getElementById("btnActualizarUsuario");

            if (btnActualizar) {

                btnActualizar.onclick = function (e) {

                    e.preventDefault();
                    actualizarUsuario(idUsuario);

                }
            }
        }
    }
}

/* ======================================================
   RENDERIZAR ROLES EN SELECT
====================================================== */

function renderizarSelectRoles(idSelect, idRolSeleccionado = null) {

    const select = document.getElementById(idSelect);

    if (!select) return;

    fetch(urlApiRoles, { headers: obtenerHeaders() })

        .then(res => res.json())

        .then(roles => {

            select.innerHTML = `<option disabled selected>Seleccione un rol...</option>`;

            roles.forEach(rol => {

                const option = document.createElement("option");

                option.value = rol.idRol;
                option.textContent = rol.rol;

                if (idRolSeleccionado && rol.idRol == idRolSeleccionado) {
                    option.selected = true;
                }

                select.appendChild(option);

            });

        })

        .catch(err => {
            console.error("Error cargando roles:", err);
        });

}

/* ======================================================
   LISTAR USUARIOS
====================================================== */

function listarUsuarios() {

    fetch(urlApiUsuarios)

        .then(res => res.json())

        .then(data => {

            const tbody = document.getElementById("tabla-usuarios");

            if (!tbody) return;

            let html = "";

            data.forEach(usuario => {

                html += `
                <tr>
                    <td>${usuario.idUsuario}</td>
                    <td>${usuario.nombreUsuario}</td>
                    <td>${usuario.apellidoPaterno}</td>
                    <td>${usuario.apellidoMaterno}</td>
                    <td>${usuario.matricula}</td>
                    <td>${usuario.telefono}</td>
                    <td><span class="badge bg-primary">${usuario.rol}</span></td>

                    <td class="text-center">

                        <button class="btn btn-sm btn-outline-warning me-2"
                        onclick="cargarVista('views/actualizar-usuario.html?idUsuario=${usuario.idUsuario}')">
                        <i class="bi bi-pencil"></i>
                        </button>

                        <button class="btn btn-sm btn-outline-danger"
                        onclick="prepararEliminacionUsuarios(${usuario.idUsuario},'${usuario.nombreUsuario}')">
                        <i class="bi bi-trash"></i>
                        </button>

                    </td>
                </tr>
                `;
            });

            tbody.innerHTML = html;

        })

        .catch(err => {

            console.error("Error al cargar usuarios:", err);

        });

}

/** ======================================================
* TODO:  BUSCADOR
====================================================== */

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
                .textContent
                .toLowerCase();

            fila.style.display = texto.includes(valor) ? "" : "none";

        });

    });

}

/* ======================================================
   PREPARAR ELIMINACIÓN
====================================================== */

window.prepararEliminacionUsuarios = function (id, nombre) {

    idUsuarioABorrar = id;

    const nombreElemento = document.getElementById("nombreUsuarioEliminar");

    if (nombreElemento) {
        nombreElemento.innerHTML = nombre;
    }

    const miModal = new bootstrap.Modal(
        document.getElementById("modalEliminarUsuarios")
    );

    miModal.show();
}

/* ======================================================
   CONFIRMAR BORRADO
====================================================== */

function confirmarBorradoUsuarioFinal() {

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

            const modal = bootstrap.Modal.getInstance(
                document.getElementById("modalEliminarUsuarios")
            );

            if (modal) modal.hide();

            listarUsuarios();

            idUsuarioABorrar = null;

        })

        .catch(err => {

            console.error("Error al eliminar:", err);

            alert("Error al eliminar usuario");

        });

}

/* ======================================================
   CARGAR DATOS PARA EDITAR
====================================================== */

function cargarDatosUsuario(id) {

    fetch(`${urlApiUsuarios}/${id}`, { headers: obtenerHeaders() })

        .then(res => res.json())

        .then(usuario => {

            document.getElementById("editarNombreUsuario").value = usuario.nombreUsuario;
            document.getElementById("editarApellidoPaterno").value = usuario.apellidoPaterno;
            document.getElementById("editarApellidoMaterno").value = usuario.apellidoMaterno;
            document.getElementById("editarMatricula").value = usuario.matricula;
            document.getElementById("editarTelefono").value = usuario.telefono;

            renderizarSelectRoles("selectRoles", usuario.idRol);

        })

        .catch(err => {

            console.error("Error cargando usuario:", err);

        });

}

/* ==========================================
    FUNCIÓN ACTUALIZAR EL USUARIO 
    ======================================== */
function actualizarUsuario(idUsuario) {

    const nombreUsuario = document.getElementById("editarNombreUsuario").value.trim();
    const apellidoPaterno = document.getElementById("editarApellidoPaterno").value.trim();
    const apellidoMaterno = document.getElementById("editarApellidoMaterno").value.trim();
    const idRol = parseInt(document.getElementById("selectRoles").value)
    const matricula = document.getElementById("editarMatricula").value;
    const telefono = document.getElementById("editarTelefono").value.trim();

    const soloNumeros = /^\d+$/.exec(matricula);

    if (!soloNumeros) {
        alert("❌ La matrícula solo debe contener números.");
        return; // Detiene la ejecución
    }

    // 2. Validamos que sean exactamente 8 caracteres
    if (matricula.length !== 8) {
        alert("❌ La matrícula debe tener exactamente 8 caracteres. (Tienes: " + matricula.length + ")");
        return; // Detiene la ejecución
    }

    if (isNaN(idRol) || idRol <= 0) {
        alert("⚠️ Seguridad: El rol seleccionado no es válido.");
        return;
    }

    if (telefono.length !== 10 || !/^\d+$/.test(telefono)) {
        alert("❌ El teléfono debe tener exactamente 10 dígitos numéricos.");
        return;
    }


    const usuarioActualizado = {
        nombreUsuario: nombreUsuario,
        apellidoPaterno: apellidoPaterno,
        apellidoMaterno: apellidoMaterno,
        matricula: matricula,
        telefono: telefono,
        idRol: idRol

    };

    fetch(`${urlApiUsuarios}/${idUsuario}`, {

        method: "PUT",
        headers: obtenerHeaders(),
        body: JSON.stringify(usuarioActualizado)

    })
        .then(res => {

            if (!res.ok) {
                throw new Error("No se pudo actualizar el usuario");
            }

            return res.json();

        })
        .then(() => {

            alert("Usuario actualizado correctamente");

            cargarVista("views/usuario.html");

        })
        .catch(err => {

            console.error("Error:", err);

            alert("Error al actualizar usuario");

        });

}



/* ======================================================
   CONFIGURAR FORMULARIO CREAR
====================================================== */
function configurarFormularioCrearUsuario() {

    const btnGuardar = document.getElementById("btnGuardarUsuario");
    const btnToggle = document.getElementById("btnTogglePassword");
    const inputPass = document.getElementById("nuevoPassword");
    const icono = document.getElementById("iconoOjito");

    /* BOTÓN GUARDAR */
    if (btnGuardar) {

        btnGuardar.onclick = function (e) {

            e.preventDefault();
            guardarNuevoUsuario();

        };
    }

    /* BOTÓN OJITO */
    if (btnToggle && inputPass) {

        btnToggle.onclick = function () {

            const tipo = inputPass.type === "password" ? "text" : "password";

            inputPass.type = tipo;

            if (icono) {
                icono.classList.toggle("bi-eye");
                icono.classList.toggle("bi-eye-slash");
            }

        };
    }

}

/* ======================================================
   CREAR NUEVO USUARIO
====================================================== */

function guardarNuevoUsuario() {

    const matricula = document.getElementById("nuevaMatricula").value.trim();
    const nombreUsuario = document.getElementById("nuevoNombre").value.trim();
    const apellidoPaterno = document.getElementById("nuevoApellidoP").value.trim();
    const apellidoMaterno = document.getElementById("nuevoApellidoM").value.trim();
    const telefono = document.getElementById("nuevoTelefono").value.trim();
    const idRol = parseInt(document.getElementById("selectRoles").value);
    const contrasena = document.getElementById("nuevoPassword").value;
    const estado = 1;

    if (!matricula || !nombreUsuario || !apellidoPaterno || !apellidoMaterno || !telefono || !contrasena) {
        alert("⚠️ Todos los campos son obligatorios.");
        return;
    }

    const soloNumeros = /^\d+$/.exec(matricula);

    if (!soloNumeros) {
        alert("❌ La matrícula solo debe contener números.");
        return; // Detiene la ejecución
    }

    // 2. Validamos que sean exactamente 8 caracteres
    if (matricula.length !== 8) {
        alert("❌ La matrícula debe tener exactamente 8 caracteres. (Tienes: " + matricula.length + ")");
        return; // Detiene la ejecución
    }

    // Validación de Roles
    if (isNaN(idRol) || idRol <= 0) {
        alert("⚠️ Seguridad: El rol seleccionado no es válido.");
        return;
    }

    //Validación de Contraseña Segura
    // Mínimo 8 caracteres, al menos una mayúscula y un número
    const regexPassword = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!regexPassword.test(contrasena)) {
        alert("❌ La contraseña debe tener al menos 8 caracteres, una mayúscula y un número.");
        return;
    }

    if (telefono.length !== 10 || !/^\d+$/.test(telefono)) {
        alert("❌ El teléfono debe tener exactamente 10 dígitos numéricos.");
        return;
    }

    const nuevoUsuario = {
        nombreUsuario: nombreUsuario,
        apellidoPaterno: apellidoPaterno,
        apellidoMaterno: apellidoMaterno,
        matricula: matricula,
        telefono: telefono,
        idRol: idRol,
        contrasena: contrasena,
        estado: estado
    };


    fetch(urlApiUsuarios, {

        method: "POST",
        headers: obtenerHeaders(),
        body: JSON.stringify(nuevoUsuario)

    })

        .then(res => {

            if (!res.ok) {
                throw new Error("Error al crear usuario");
            }

            return res.json();

        })

        .then(() => {

            alert("Usuario creado correctamente");

            cargarVista("views/usuario.html");

        })

        .catch(err => {

            console.error("Error:", err);

            alert("No se pudo crear el usuario");

        });

}