//  ? Primeramente usamos un DOMContentLoaded para que automaticamente se inicie el index cargue el apartado
document.addEventListener('DOMContentLoaded', async () => {
    // TODO: . Detección de Sistema e Icono

    const ua = navigator.userAgent; // * <-- El user Agent es una cadena de texto larga que envía el navegador 
    const iconEl = document.getElementById('device-icon');
    const osEl = document.getElementById('os-name');

    // TODO: Buscamos en el texto con el 
    /* 
     ! ua.includes buscamos la palabra clave 
     ? "Win"
     ? "Android"
     ? "Mac"
     ? "iPhone"
     ? "Linux"
     ? "CrOS"
    */

    if (ua.includes("Win")) {
        iconEl.innerText = "🪟";
        osEl.innerText = "Windows PC";
    }
    else if (ua.includes("Mac")) {
        iconEl.innerText = "🍎";
        osEl.innerText = "Apple Mac";
    }
    else if (ua.includes("Android")) {
        iconEl.innerText = "📱";
        osEl.innerText = "Android";
    }
    else if (ua.includes("iPhone")) {
        iconEl.innerText = "📱";
        osEl.innerText = "iPhone/iOS";
    }
    else if (ua.includes("Linux")) {
        iconEl.innerText = "🐧";
        osEl.innerText = "Linux Distro";
    }
    else if (ua.includes("CrOS")) {
        iconEl.innerText = "💻";
        osEl.innerText = "ChromeOS";
    }
   // *  Llevanmos los elementos con el id y ponemos los núcleos lógicos y la Ram Aproximadamente 
   // * NOTA: LA RAM NO ES EXACTA ES UN APROXIMADO 
   
    document.getElementById('cpu-info').innerText = (navigator.hardwareConcurrency || "N/A") + " Núcleos Lógicos";
    document.getElementById('ram-info').innerText = (navigator.deviceMemory || "N/A") + " GB aprox.";

    // Resolución considerando densidad de píxeles
    const w = window.screen.width * window.devicePixelRatio;
    const h = window.screen.height * window.devicePixelRatio;
    document.getElementById('screen-info').innerText = `${Math.round(w)} x ${Math.round(h)} px`;

    // 3. Red y Batería
    if (navigator.connection) {
        document.getElementById('net-info').innerText = navigator.connection.effectiveType.toUpperCase();
    }

    if ('getBattery' in navigator) {
        const battery = await navigator.getBattery();
        const updateBat = () => {
            const level = Math.round(battery.level * 100);
            const badge = document.getElementById('bat-badge');
            badge.innerText = `${level}% ${battery.charging ? '⚡ (Cargando)' : ''}`;
            badge.className = `badge rounded-pill ${level > 20 ? 'bg-success' : 'bg-danger'}`;
        };
        updateBat();
        battery.onlevelchange = updateBat;
        battery.onchargingchange = updateBat;
    }
});

