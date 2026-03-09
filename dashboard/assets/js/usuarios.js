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
       VISTA: CREAR MODELO
    --------------------------*/

    else if (ruta.includes("crear-usuario.html")) {

        const select = document.getElementById("selectRoles");

        if (select) {

            // cargamos el select sin marca seleccionada
            renderizarSelectMarcas("selectRoles");
        }
    }
}



/* 
<tr>
                                    <td>1</td>
                                    <td>Dylan Estuardo</td>
                                    <td>Flores</td>
                                    <td>Sagahón</td>
                                    <td>20240989</td>
                                    <td><span class="badge bg-primary">Administrador</span></td>
                                    <td class="text-center">

                                        <button  class="btn btn-sm btn-outline-warning me-2" onclick="cargarVista('views/actualizar-usuario.html')">
                                            <i class="bi bi-pencil"></i>
                                        </button>

                                        <button class="btn btn-sm btn-outline-danger">
                                            <i class="bi bi-trash"></i>
                                        </button>

                                    </td>
                                </tr>
*/