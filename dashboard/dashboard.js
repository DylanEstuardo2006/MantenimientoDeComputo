window.cargarVista = function (ruta) {
    fetch(ruta)
        .then(response => response.text())
        .then(data => {
            document.getElementById("contenido-principal").innerHTML = data;

            // --- LÓGICA DE MARCAS ---
            if (ruta.includes('marcas.html') || ruta.includes('crear-marca.html') || ruta.includes('actualizar-marcas.html')) {
                if (typeof inicializarModuloMarcas === 'function') {
                    inicializarModuloMarcas(ruta);
                }
            }

            // --- LÓGICA DE MODELOS ---
            if (ruta.includes('modelos.html') || ruta.includes('crear-modelo.html') || ruta.includes('actualizar-modelo.html')) {
                if (typeof inicializarModuloModelos === 'function') {
                    inicializarModuloModelos(ruta);
                }
            }
             
            // --- LÓGICA DE USUARIOS ---
            if(ruta.includes('usuarios.html') || ruta.includes('crear-usuario.html') || ruta.includes('actualizar-usuario.html'))
            {
                if(typeof inicializarModuloMarcas === 'function')
                {
                    inicializarModuloUsuarios(ruta);
                }
            }

            // ---- LÓGICA DE DISPOSITIVOS ---- 


            
            // --- LÓGICA DE UI (Sidebar) ---
            if (window.innerWidth < 992) {
                sidebar.classList.remove("show-sidebar");
                overlay.classList.remove("show");
            }
        });
}


// botones
const btnMenu = document.getElementById("btnMenu");
const sidebar = document.getElementById("sidebar");

// abrir / cerrar
btnMenu.addEventListener("click", () => {
    sidebar.classList.toggle("show-sidebar");
});

// cerrar si hacen click fuera del menú
document.addEventListener("click", (e) => {

    const clickDentroSidebar = sidebar.contains(e.target);
    const clickBoton = btnMenu.contains(e.target);

    if (!clickDentroSidebar && !clickBoton) {
        sidebar.classList.remove("show-sidebar");
    }

});

const overlay = document.getElementById("overlay");

// cerrar al presionar overlay
overlay.addEventListener("click", () => {
    sidebar.classList.remove("show-sidebar");
    overlay.classList.remove("show");
});

// limpiar cuando cambia el tamaño de pantalla
window.addEventListener("resize", () => {
    if (window.innerWidth >= 992) {
        sidebar.classList.remove("show-sidebar");
        overlay.classList.remove("show");
    }
});

