const urlMarcas = 'https://pratica-5b-node-s1hu.vercel.app/api/marcas';

let idMarcaABorrar = null;
let idMarcaAEditar = null; // <-- AGREGADO: Variable global para edición

function inicializarModuloMarcas(ruta) {
    console.log("Módulo de Marcas activado...");

    if (ruta.includes('marcas.html')) {
        listarMarcas();
        configurarBuscadorMarcas();
        const btnBorrar = document.getElementById('btnConfirmarBorrado');
        if(btnBorrar) btnBorrar.onclick = confirmarBorradoFinal;
    }

    if (ruta.includes('actualizar-marcas.html')) {
        const urlParams = new URLSearchParams(ruta.split('?')[1]);
        idMarcaAEditar = urlParams.get('idMarca');

        if (idMarcaAEditar) {
            console.log("Editando marca ID:", idMarcaAEditar);
            cargarDatosEnFormulario(idMarcaAEditar); // <-- Esta función faltaba
        }
    }

    if (ruta.includes('crear-marca.html')) {
        // Aquí puedes inicializar eventos del formulario de creación si los hay
    }
}

function listarMarcas() {
    fetch(urlMarcas)
        .then(res => res.json())
        .then(data => {
            const tbody = document.getElementById('tabla-marcas');
            if(!tbody) return;
            tbody.innerHTML = ''; 

            data.forEach(marca => {
                tbody.innerHTML += `
                  <tr>
                    <td>${marca.idMarca}</td>
                    <td>${marca.nombreMarca}</td>
                    <td class="text-center">
                        <button class="btn btn-sm btn-outline-warning me-2" 
                                onclick="cargarVista('views/actualizar-marcas.html?idMarca=${marca.idMarca}')">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" 
                                onclick="prepararEliminacion(${marca.idMarca}, '${marca.nombreMarca}')">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                  </tr>
                `;
            });
            configurarBuscadorMarcas();
        })
        .catch(err => console.error("Error al obtener marcas:", err));
}

// NUEVA FUNCIÓN: Para llenar el formulario al entrar a editar
function cargarDatosEnFormulario(id) {
    fetch(`${urlMarcas}/${id}`)
        .then(res => res.json())
        .then(marca => {
            // Asegúrate que en tu HTML de actualizar el input tenga id="nombreMarca"
            const input = document.getElementById('nombreMarca');
            if(input) {
                input.value = marca.nombreMarca;
            }
        })
        .catch(err => console.error("Error al cargar datos:", err));
}

// ... (Tus funciones de buscador y eliminar se mantienen igual)

// 3. Función para el filtro de búsqueda (Frontend)
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



// Esta función se llama desde el botón de la papelera en la tabla
window.prepararEliminacion = function(id, nombre) {
    idMarcaABorrar = id;
    // Ponemos el nombre de la marca en el modal para que el usuario sepa qué está haciendo
    document.getElementById('nombreMarcaEliminar').innerText = nombre;
    
    // Mostramos el modal de Bootstrap manualmente
    const miModal = new bootstrap.Modal(document.getElementById('modalEliminar'));
    miModal.show();
}

//Confirmar Borrado Final

window.confirmarBorradoFinal = function() {
    if (idMarcaABorrar) {
        fetch(`${urlMarcas}/${idMarcaABorrar}`,
            { method: 'DELETE' })
            .then(() => {
                const modal = bootstrap.Modal.getInstance(document.getElementById('modalEliminar'));
                modal.hide();
                listarMarcas();
            });
    }
};

window.guardarActualizacionMarca = function(event) {
    event.preventDefault(); // Evita que la página se recargue

    const nuevoNombre = document.getElementById('nombreMarca').value;

    if (!nuevoNombre) {
        alert("El nombre no puede estar vacío");
        return;
    }

    const datosActualizados = {
        nombreMarca: nuevoNombre
    };

    // Usamos el idMarcaAEditar que capturamos en el inicializador
    fetch(`${urlMarcas}/${idMarcaAEditar}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(datosActualizados)
    })
    .then(res => {
        if (res.ok) {
            console.log("Marca actualizada con éxito");
            // Redirigimos de vuelta a la tabla
            cargarVista('views/marcas.html');
        } else {
            alert("Error al actualizar en el servidor");
        }
    })
    .catch(err => {
        console.error("Error en la petición PUT:", err);
        alert("No se pudo conectar con el servidor.");
    });
};