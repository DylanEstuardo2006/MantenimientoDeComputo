const btnToggle = document.getElementById("btnTogglePassword");
const inputPass = document.getElementById("password");
const icono = document.getElementById("iconoOjito");
  
    
    /* BOTÓN OJITO */
    if (btnToggle && inputPass) {

        btnToggle.onclick = function () {

            const tipo = inputPass.type === "password" ? "text" : "password";

            inputPass.type = tipo;

            if (icono) {
                icono.classList.toggle("bi-eye");
                icono.classList.toggle("bi-eye-slash");
            }

        };
    }