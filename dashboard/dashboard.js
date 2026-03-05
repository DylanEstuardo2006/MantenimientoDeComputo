window.cargarVista= function(ruta){
    fetch(ruta)
        .then(response => response.text())
        .then(data => {

            document.getElementById("contenido-principal").innerHTML = data;

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