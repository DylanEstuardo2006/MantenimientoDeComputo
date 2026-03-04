function cargarVista(ruta) {
    fetch(ruta)
        .then(response => response.text())
        .then(data => {
            document.getElementById("contenido-principal").innerHTML = data;
        });
}