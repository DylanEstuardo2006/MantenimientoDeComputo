/**  ==========================================================================
  * ? SEGURIDAD: VERIFICACIÓN DE ACCESO
  * ? Se ejecuta antes de cualquier otra cosa para evitar accesos no autorizados.
   ========================================================================== */
/** 
 * * inicializarDashboard
 * * Configura la vista inicial y los permisos de la interfaz según el rol del usuario.
 */
/** 
 * TODO: 1. Declaramos el usuario a nivel global para que todos los módulos lo vean
*/

let usuarioGlobal = null;

function inicializarDashboard() {
    // Intentamos obtener la sesión
    const sesion = localStorage.getItem("userSession");


    if (!sesion) {
        window.location.replace("../login.html");
        return;
    }

    usuarioGlobal = JSON.parse(sesion);

    /**
     * TODO --- NUEVO: INSERTAR DATOS EN EL HEADER ---
     * 
     * TODO  USAMOS MATRICULA Por que el objeto no trae nombreUsuario 
    */
    const displayNombre = document.getElementById("nombre-usuario-header");

    if (displayNombre) {
        const token = localStorage.getItem("token");

        if (token) {
            try {
                // Dividimos el token y decodificamos el payload (segunda parte del JWT)
                const base64Url = token.split(".")[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/'); // Formateo estándar Base64
                const payload = JSON.parse(atob(base64));

                displayNombre.textContent = `Matrícula: ${payload.matricula || 'N/A'}`;
            } catch (error) {
                console.error("Error al decodificar el token:", error);
                displayNombre.textContent = "Error de sesión";
            }
        } else {
            displayNombre.textContent = "Sin sesión";
        }
    }

    // ! AJUSTE: Usamos .rol en lugar de .idRol porque así viene del servidor

    const rolTexto = usuarioGlobal.rol === 1 ? "Administrador" : "Técnico";
    const displayRol = document.getElementById("rol-usuario-header");

    if (displayRol) {
        displayRol.textContent = rolTexto;
    }

    // * Confirmar CerrarSession
    const btnBorrar = document.getElementById("btnConfirmarCerrado");

    if (btnBorrar) {
        btnBorrar.onclick = confirmarCerrarSession;
    }

    //  ! --- LÓGICA POR ROLES ---

    if (usuarioGlobal.rol === 1) {
        cargarVista('views/administrador.html');
    } else {

        // ! Ocultar elementos para técnicos
        ["btn-menu-usuarios", "btn-menu-ordenes"].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'none';
        });
        cargarVista('views/tecnico.html');
    }
}
/* ==========================================================================
  TODO:  SISTEMA DE RUTEO DINÁMICO (SPA - Single Page Application)
   ========================================================================== */

/**
 * window.cargarVista
 * Carga archivos HTML de forma asíncrona dentro del contenedor principal.
 * @param {string} ruta - El camino al archivo .html (ej: 'views/usuarios.html')
 */
window.cargarVista = function (ruta) {

    // --- NUEVO: FILTRO DE SEGURIDAD POR RUTA ---
    const usuario = JSON.parse(localStorage.getItem("userSession"));

    // Si es técnico (Rol 2) e intenta cargar algo de usuarios, lo bloqueamos
    if (usuario.rol === 2 && ruta.includes('usuario') || usuario.rol === 2 && ruta.includes('ordenes')) {
        console.warn("Acceso denegado a usuarios para este rol.");
        cargarVista('views/tecnico.html'); // Lo regresamos a su casita
        return; // Detenemos el fetch
    }
    // -------------------------------------------

    fetch(ruta)
        .then(response => response.text())
        .then(data => {
            // Inyectamos el HTML en el contenedor central
            document.getElementById("contenido-principal").innerHTML = data;

            /* ---------------------------------------------------------
              TODO:  INICIALIZACIÓN DE MÓDULOS ESPECÍFICOS
              TODO:  Dependiendo de la ruta cargada, activamos su lógica JS.
               --------------------------------------------------------- */

            // Lógica de MARCAS
            if (ruta.includes('marcas.html') || ruta.includes('crear-marcas.html') || ruta.includes('actualizar-marcas.html')) {
                if (typeof inicializarModuloMarcas === 'function') {
                    inicializarModuloMarcas(ruta);
                }
            }

            // Lógica de MODELOS
            if (ruta.includes('modelos.html') || ruta.includes('crear-modelo.html') || ruta.includes('actualizar-modelo.html')) {
                if (typeof inicializarModuloModelos === 'function') {
                    inicializarModuloModelos(ruta);
                }
            }

            // Lógica de USUARIOS
            if (ruta.includes('usuario.html') || ruta.includes('crear-usuario.html') || ruta.includes('actualizar-usuario.html')) {
                if (typeof inicializarModuloUsuarios === 'function') {
                    inicializarModuloUsuarios(ruta);
                }
            }
            if (ruta.includes('dispositivos.html') || ruta.includes('crear-dispositivos.html') || ruta.includes('actualizar-dispositivos.html')) {
                if (typeof inicializarModuloDispositivos === 'function') {
                    inicializarModuloDispositivos(ruta);
                }
            }

            if (ruta.includes('ordenes.html') || ruta.includes('crear-ordenes.html') || ruta.includes('detalles-ordenes.html')) {
                if (typeof inicializarModuloOrdenes === 'function') {
                    inicializarModuloOrdenes(ruta);
                }
            }

            // --- GESTIÓN DE UI (Cerrar sidebar en móviles tras click) ---
            if (window.innerWidth < 992) {
                sidebar.classList.remove("show-sidebar");
                if (overlay) overlay.classList.remove("show");
            }
        })
        .catch(err => console.error("Error al cargar la vista:", err));
}


/* ==========================================================================
   INTERACCIÓN DE LA INTERFAZ (UI)
   Control de Sidebar, Menús Colapsables y Responsividad.
   ========================================================================== */

const btnMenu = document.getElementById("btnMenu");
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");

// Abrir / Cerrar Sidebar
btnMenu.addEventListener("click", () => {
    sidebar.classList.toggle("show-sidebar");
    if (overlay) overlay.classList.toggle("show");
});

// Cerrar sidebar si se hace click fuera de él
document.addEventListener("click", (e) => {
    const clickDentroSidebar = sidebar.contains(e.target);
    const clickBoton = btnMenu.contains(e.target);

    if (!clickDentroSidebar && !clickBoton) {
        sidebar.classList.remove("show-sidebar");
        if (overlay) overlay.classList.remove("show");
    }
});

// Cerrar al presionar el overlay (fondo oscuro en móviles)
if (overlay) {
    overlay.addEventListener("click", () => {
        sidebar.classList.remove("show-sidebar");
        overlay.classList.remove("show");
    });
}

// Limpiar estados de UI cuando se cambia el tamaño de la ventana
window.addEventListener("resize", () => {
    if (window.innerWidth >= 992) {
        sidebar.classList.remove("show-sidebar");
        if (overlay) overlay.classList.remove("show");
    }
});

const boton = document.getElementById("btn-logout");

boton.addEventListener("click", function () {
    const token = localStorage.getItem("token");

    const payload = JSON.parse(atob(token.split(".")[1]));

    const matricula = payload.matricula;

    modalCerrarSession(matricula);
});

window.modalCerrarSession = function (matriculaGuardada) {

    const matriculaUsuario = document.getElementById("matriculaCerrarSession");

    if (matriculaUsuario) {
        matriculaUsuario.innerHTML = matriculaGuardada;
    }

    const miModal = new bootstrap.Modal(
        document.getElementById("modalCerrarSession")
    );

    miModal.show();
}

function confirmarCerrarSession() {

    localStorage.clear(); // Borra el token y la sesión

    const modalElement = document.getElementById("modalCerrarSession");
    const modalInstance = bootstrap.Modal.getInstance(modalElement);
    if (modalInstance)  modalInstance.hide();
    
    // Llamamos a la función maestra
    cerrarSesionGlobal();

}
// Al cargar la página, arrancamos la lógica
document.addEventListener("DOMContentLoaded", inicializarDashboard);