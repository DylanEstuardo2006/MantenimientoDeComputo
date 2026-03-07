

function inicializarModuloModelos() {
    console.log("Inicializando interfaz de modelos.");
    
    // Solo cargamos roles si existe el select en el HTML actual
    if (document.getElementById('selectMarca')) {
        cargarMarcas();
    }
}
const urlApiMarcas = "https://pratica-5b-node-s1hu.vercel.app/api/marcas";
function cargarMarcas(){
    fetch(urlApiMarcas)
    .then(res => res.json())
    .then(data => {
        const select = document.getElementById("selectMarca");

        data.forEach(marca => {
            select.innerHTML += `
                <option value="${marca.idMarca}">
                    ${marca.nombreMarca}
                </option>
            `;
        });
    })
    .catch(err => console.error("Error al cargar roles:", err));
}
