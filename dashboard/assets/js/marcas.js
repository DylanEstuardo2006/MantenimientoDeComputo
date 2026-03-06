
const urlMarcas = 'https://pratica-5b-node-s1hu.vercel.app/api/marcas';
// 1. Función para obtener y mostrar las marcas
function listarMarcas() {
    fetch(urlMarcas)
        .then(res => res.json())
        .then(data => {
            const tbody = document.getElementById('tabla-marcas');
            tbody.innerHTML = ''; // Limpiar tabla

            data.forEach(marca => {
                tbody.innerHTML += `
                  <tr>
                     <td>${marca.idMarca}</td>
                        <td>${marca.nombreMarca}</td>
                           <td class="text-center">
                             <button  class="btn btn-sm btn-outline-warning me-2" onclick="cargarVista('views/actualizar-marcas.html?idMarca=${marca.idMarca}')">
                             <i class="bi bi-pencil"></i>
                             </button>
                             <button class="btn btn-sm btn-outline-danger" onclick="prepararEliminacion(${marca.idMarca}, '${marca.nombreMarca}')">
                             <i class="bi bi-trash"></i>
                             </button>
                       </td>
                  </tr>
                `;
            });
            
            // Una vez cargadas, activamos el buscador
            configurarBuscadorMarcas();
        })
        .catch(err => console.error("Error al obtener marcas:", err));
}

// 2. Función para el filtro de búsqueda (Frontend)
function configurarBuscadorMarcas() {
    const input = document.getElementById('inputBuscarMarca');
    const tabla = document.getElementById('tabla-marcas');
    
    if (input) {
        input.addEventListener('keyup', function() {
            const valor = input.value.toLowerCase();
            const filas = tabla.getElementsByTagName('tr');

            Array.from(filas).forEach(fila => {
                // Buscamos en la segunda columna (Nombre)
                const textoColumna = fila.getElementsByTagName('td')[1].textContent.toLowerCase();
                
                if (textoColumna.includes(valor)) {
                    fila.style.display = ''; // Mostrar
                } else {
                    fila.style.display = 'none'; // Ocultar
                }
            });
        });
    }
}

// Variable global para saber qué ID vamos a borrar
let idMarcaABorrar = null;

// Esta función se llama desde el botón de la papelera en la tabla
function prepararEliminacion(id, nombre) {
    idMarcaABorrar = id;
    // Ponemos el nombre de la marca en el modal para que el usuario sepa qué está haciendo
    document.getElementById('nombreMarcaEliminar').innerText = nombre;
    
    // Mostramos el modal de Bootstrap manualmente
    const miModal = new bootstrap.Modal(document.getElementById('modalEliminar'));
    miModal.show();
}

// Configuramos el evento del botón "Eliminar definitivamente" del modal
document.getElementById('btnConfirmarBorrado').addEventListener('click', () => {
    if (idMarcaABorrar) {
        fetch(`${urlMarcas}/${idMarcaABorrar}`, { method: 'DELETE' })
            .then(res => {
                if(res.ok) {
                    // Cerramos el modal usando las clases de Bootstrap
                    const modalElement = document.getElementById('modalEliminar');
                    const modalInstance = bootstrap.Modal.getInstance(modalElement);
                    modalInstance.hide();
                    
                    listarMarcas(); // Recargamos la tabla
                }
            })
            .catch(err => console.error("Error:", err));
    }
});s