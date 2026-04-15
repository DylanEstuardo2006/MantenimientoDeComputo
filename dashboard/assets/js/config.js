// assets/js/config.js

// ? 1. Verificación de Seguridad Global del token 

if (!localStorage.getItem("token")) {
    window.location.replace("../login.html");
}

function obtenerHeaders() {
    const token = localStorage.getItem("token");
    return {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : ""
    };
}
// 3. NUEVO: Función Global de Cerrar Sesión
// Así no dependes de que dashboard.js esté cargado o no
window.cerrarSesionGlobal = function() {
    localStorage.clear(); // Limpia token y datos de usuario
    window.location.replace("../login.html");
};