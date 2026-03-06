// URL de la API de Roles de Usuario
const urlApi = 'https://pratica-5b-node-s1hu.vercel.app/api/roles';

function cargarRoles(){
    fetch(urlApi)
    .then(res => res.json())
    .then(data => {
        const select = document.getElementById("selectRoles");

        data.forEach(rol => {
            select.innerHTML += `
                <option value="${rol.idRol}">
                    ${rol.rol}
                </option>
            `;
        });
    })
    .catch(err => console.error("Error al cargar roles:", err));
}
