const urlApiNoticias = 'https://pratica-5b-node-s1hu.vercel.app/api/novedades';
let noticias = []; // Variable global para guardar los datos

function cargarNoticias() {
    fetch(urlApiNoticias)
        .then(res => res.json())
        .then(data => {
            if (!data) return;
            noticias = data; // Guardamos en la global
            mostrarNoticias(noticias);
        })
        .catch(err => console.error("Error al cargar:", err));
}

function mostrarNoticias(listaNoticias) {
    const container = document.getElementById("contenedor-noticias");
    container.innerHTML = "";
    let html = "";

    listaNoticias.forEach(noticia => {
        const fechaFormateada = new Date(noticia.fecha).toLocaleDateString('es-MX', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });

        html += `
        <div class="col-12 col-md-6 col-lg-4">
            <div class="card h-100 shadow-sm border-0">
                <div style="height: 200px; overflow: hidden; border-radius: 12px 12px 0 0;">
                    <img src="${noticia.imagen}" class="w-100 h-100 object-fit-cover" alt="Noticia">
                </div>
                <div class="card-body p-4">
                    <div class="d-flex justify-content-between mb-2">
                        <span class="badge bg-primary-subtle text-primary px-3">Sistema News</span>
                        <small class="text-muted">${fechaFormateada}</small>
                    </div>
                    <h5 class="card-title fw-bold mb-3">${noticia.tituloNovedad}</h5>
                    <p class="card-text text-secondary small">${noticia.encabezado}</p>
                </div>
                <div class="card-footer bg-white border-0 pb-4 px-4">
                    <button 
                        class="btn btn-outline-primary w-100 rounded-pill fw-bold" 
                        onclick="verDetalles(${noticia.idNovedad})"
                        data-bs-toggle="modal" 
                        data-bs-target="#modalNoticia">
                        Ver detalles
                    </button>
                </div>
            </div>
        </div>`;
    });
    container.innerHTML = html;


}

// Función para mostrar la info completa en el modal
window.verDetalles = function (id) {
    const noticia = noticias.find(n => n.idNovedad === id);
    const modalBody = document.getElementById('modal-content-body');

    if (noticia) {
        // Creamos una función rápida para limpiar el texto
        const limpiarTexto = (texto) => {
            if (!texto) return '';
            // Esto ayuda a que el navegador interprete entidades HTML y emojis
            const txt = document.createElement("textarea");
            txt.innerHTML = texto;
            return txt.value;
        };

        modalBody.innerHTML = `
    <div class="mb-4 rounded-3 overflow-hidden shadow-sm">
        <img src="${noticia.imagen}" class="w-100 img-fluid" style="max-height: 500px; object-fit: contain; background-color: #f8f9fa;">
    </div>
    <div class="text-center mb-4">
        <h2 class="fw-bold">${limpiarTexto(noticia.tituloNovedad)}</h2>
    </div>
    <div class="p-4 bg-light rounded-3 border-start border-primary border-4">
        <p class="mb-0 text-dark" style="white-space: pre-line;">
            ${limpiarTexto(noticia.informacion)}
        </p>
    </div>
`;
    }
};
document.addEventListener("DOMContentLoaded", cargarNoticias);