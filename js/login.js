const urlApi = 'https://pratica-5b-node-s1hu.vercel.app/api/';

async function ejecutarLogin(event) {
    event.preventDefault();

    const matriculaInput = document.getElementById("matricula").value.trim();
    const passwordInput = document.getElementById("password").value;

    const datosUsuario = {
        matricula: matriculaInput,
        contrasena: passwordInput
    };

    try {
        const response = await fetch(`${urlApi}auth/login`, { // Usamos la variable urlApi
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datosUsuario)
        });

        const data = await response.json();

        if (response.ok) {
            // Guardamos token y datos del usuario (id y rol)
            localStorage.setItem("token", data.token);
            localStorage.setItem("userSession", JSON.stringify(data.usuario));

            console.log("Login exitoso, redirigiendo...");
            window.location.href = "dashboard/dashboard.html"; 
        } else {
            alert(data.message || "Credenciales inválidas");
        }
    } catch (error) {
        console.error("Error de red:", error);
        alert("Error de conexión con el servidor.");
    }
}