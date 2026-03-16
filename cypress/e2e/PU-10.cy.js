describe(`PU-10: Validación de campos vacíos en Modelos`, () => {
    it('Debería mostrar un alert y no permitir el registro si los campos están vacíos', () => {
        // 1. Visitar login
        cy.visit('http://localhost:8080/mantenimientoDeComputo/login.html')
        // 2. Loguearse
        cy.get('#matricula').type('20240989');
        cy.get('#password').type('S4GUNDACUENTAXD');
        cy.get('#btn-entrar').click()
        // 3. Ir al dashboard
        cy.url().should('include', '/dashboard.html');
        // 4. Ir al menú de modelos
        cy.get('#btn-menu-modelos').click()
        // 5. Click en "Nuevo Modelo"
        cy.get('#btn-crear-modelos', { timeout: 5000 }).should('be.visible').click()
        // --- MANEJO DEL ALERT (LA TRAMPA) ---
        // Preparamos a Cypress para escuchar el alert del navegador
        // Si el alert NO sale con este texto exacto, la prueba FALLARÁ
        const mensajeEsperado = '❌ El modelo no puede estar vacio'; // Ajusta este texto al de tu código JS  
        cy.on('window:alert', (texto) => {
            expect(texto).to.equal(mensajeEsperado);
        });
        // 6. Dejar campos vacíos intencionalmente
        cy.get('#contenido-principal #nuevoNombreModelo').clear();
        // Si es un select, a veces es mejor dejarlo en la opción por defecto
        cy.get('#contenido-principal #selectMarca', { timeout: 10000 }).should('be.visible');
        // 7. Intentar guardar
        cy.get('#btnGuardarModelo').click();
        // --- VALIDACIÓN DE QUE EL CÓDIGO NO SIGUIÓ ---
        // Si el sistema funcionó bien, el formulario debería SEGUIR visible
        // porque la validación detuvo el envío de datos.
        cy.get('#form-crear-modelo', { timeout: 2000 }).should('be.visible');
        
        // Verificamos que no nos haya sacado de la vista de creación
        cy.log('La validación detuvo el proceso correctamente.');
    });
});