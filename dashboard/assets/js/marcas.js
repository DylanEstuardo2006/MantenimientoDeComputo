// ============================================================
//  marcas.js  –  CRUD completo para el módulo de Marcas
// ============================================================

const urlMarcas = 'https://pratica-5b-node-s1hu.vercel.app/api/marcas';

// Variables de estado del módulo
let idMarcaABorrar = null;
let idMarcaAEditar = null;

// ─────────────────────────────────────────────
//  INICIALIZADOR  (llamado desde el router)
// ─────────────────────────────────────────────
function inicializarModuloMarcas(ruta) {
    console.log("Módulo de Marcas activado:", ruta);

    if (ruta.includes('actualizar-marcas.html')) {
        
        const query = ruta.includes('?') ? ruta.split('?')[1] : '';
       
        const params = new URLSearchParams(query);
        
        idMarcaAEditar = params.get('idMarca');

        if (idMarcaAEditar) {
            console.log("Editando marca ID:", idMarcaAEditar);
            cargarDatosMarcaEnFormulario(idMarcaAEditar);
        } else {
            console.warn("No se recibió idMarca en la URL.");
        }

    } else if (ruta.includes('crear-marcas.html')) {
        configurarFormularioCrearMarca();
    } else if (ruta.includes('marcas.html')) {
        listarMarcas();
        const btnBorrar = document.getElementById('btnConfirmarBorrado');
        if (btnBorrar) btnBorrar.onclick = confirmarBorradoMarcaFinal;
    }
}


// ─────────────────────────────────────────────
//  LISTAR
// ─────────────────────────────────────────────
function listarMarcas() {
    fetch(urlMarcas)
        .then(res => res.json())
        .then(data => {
            const tbody = document.getElementById('tabla-marcas');
            if (!tbody) return;

            tbody.innerHTML = '';

            data.forEach(marca => {
                tbody.innerHTML += `
                  <tr>
                    <td>${marca.idMarca}</td>
                    <td>${marca.nombreMarca}</td>
                    <td class="text-center">
                        <button id="btn-editar-marcas" class="btn btn-sm btn-outline-warning me-2"
                                onclick="cargarVista('views/actualizar-marcas.html?idMarca=${marca.idMarca}')">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button  id="btn-eliminar-marcas" class="btn btn-sm btn-outline-danger"
                                onclick="prepararEliminacionMarcas(${marca.idMarca},'${marca.nombreMarca}')">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                  </tr>`;
            });

            // El buscador se configura DESPUÉS de poblar la tabla
            configurarBuscadorMarcas();
        })
        .catch(err => console.error("Error al obtener marcas:", err));
}


// ─────────────────────────────────────────────
//  BUSCADOR (filtro frontend)
// ─────────────────────────────────────────────
function configurarBuscadorMarcas() {
    const input = document.getElementById('inputBuscarMarca');
    const tbody = document.getElementById('tabla-marcas');
    if (!input || !tbody) return;

    // Elimina listeners anteriores clonando el nodo
    const nuevoInput = input.cloneNode(true);
    input.parentNode.replaceChild(nuevoInput, input);

    nuevoInput.addEventListener('keyup', function () {
        const valor = nuevoInput.value.toLowerCase().trim();

        Array.from(tbody.getElementsByTagName('tr')).forEach(fila => {
            const celda = fila.getElementsByTagName('td')[1]; // columna Nombre
            if (!celda) return;
            fila.style.display = celda.textContent.toLowerCase().includes(valor) ? '' : 'none';
        });
    });
}

/* =======================================
  CONFIGURAR NUEVO USUARIO 
========================================= */

function configurarFormularioCrearMarca()
{
    const form = document.getElementById("formCrearMarca");

    if(form){
        form.addEventListener("submit", function(e){
            e.preventDefault();
            guardarNuevaMarca();
        });
    }
}

// ─────────────────────────────────────────────
//  CREAR
// ─────────────────────────────────────────────
guardarNuevaMarca = function () {

    const nombreMarca = document.getElementById('nombreMarca')?.value.trim();
    
    if (!nombreMarca) {
        alert("El nombre no puede estar vacío.");
        return;
    }
    
    const nuevaMarca = {
        nombreMarca: nombreMarca
    }

    fetch(urlMarcas, {
        method: "POST",
        headers: obtenerHeaders(),
        body: JSON.stringify(nuevaMarca)
    })
        .then(res => {
            
            if (!res.ok) {
                throw new Error("Error al crear la marca");
            }

            return res.json();
        })
        .then(() => {
             alert("Marca creado correctamente");

            cargarVista("views/marcas.html");
        })
        .catch(err => {
            console.error("Error en la petición POST:", err);
            alert("No se pudo crear la marca");
        });
};


// ─────────────────────────────────────────────
//  CARGAR DATOS EN FORMULARIO (edición)
// ─────────────────────────────────────────────
cargarDatosMarcaEnFormulario = function (idMarca) {
   
    fetch(`${urlMarcas}/${idMarca}`, {headers: obtenerHeaders()})
        .then(res => res.json())
        .then(marca => {
            
            const input = document.getElementById('editarNombreMarca');

            if (input) input.value = marca.nombreMarca ?? '';
        })
        .catch(err => console.error(">>> Error:", err));
}

// ─────────────────────────────────────────────
//  ACTUALIZAR
// ─────────────────────────────────────────────
window.guardarActualizacionMarca = function (event) {
    event.preventDefault();


    const nombreMarca = document.getElementById('editarNombreMarca')?.value.trim();
    
    if (!nombreMarca) {
        alert("El nombre no puede estar vacío.");
        return;
    }

    const marcaActualizada = {
      nombreMarca: nombreMarca
    }

    fetch(`${urlMarcas}/${idMarcaAEditar}`, {
        method: 'PUT',
        headers: obtenerHeaders(),
        body: JSON.stringify(marcaActualizada)
    })
        .then(res => {
            if (!res.ok) {
                throw new Error("No se pudo actualizar la marca");
            }

            return res.json();
        })
         .then(() => {

            alert("Marca actualizada correctamente");

            cargarVista("views/marcas.html");

        })
        .catch(err => {
            
            console.error("Error:", err);

             alert("Error al actualizar usuario");
        });
};


// ─────────────────────────────────────────────
//  ELIMINAR
// ─────────────────────────────────────────────
window.prepararEliminacionMarcas = function (id, nombre) {
   
    idMarcaABorrar = id;

    const span = document.getElementById('nombreMarcaEliminar');
    if (span) span.innerText = nombre;

    const modalElement = document.getElementById('modalEliminarMarcas');

    if (!modalElement) {
        console.error("No se encontró el modalEliminarMarcas en el DOM");
        return;
    }

    const miModal = new bootstrap.Modal(modalElement);
    miModal.show();
};

/* ======================================
CONFIRMAR BORRADO 
========================================= */

function confirmarBorradoMarcaFinal () {
    if (!idMarcaABorrar) return;

    fetch(`${urlMarcas}/${idMarcaABorrar}`, 
        { method: 'DELETE' , 
          headers: obtenerHeaders () })
          
        .then(res => {
             if (!res.ok) {
                throw new Error("No se pudo eliminar la marca");
            }

            return res.json();
        })
        .then(() => {

            const modal = bootstrap.Modal.getInstance(
                document.getElementById("modalEliminarMarcas")
            );

            if (modal) modal.hide();

            listarMarcas();

            idMarcaABorrar = null;

        })

        .catch(err => {
            console.error("Error en la petición DELETE:", err);
            alert("No se pudo conectar con el servidor.");
        });
};
