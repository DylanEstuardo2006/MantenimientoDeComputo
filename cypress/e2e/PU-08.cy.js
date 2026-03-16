describe(`PU-08: Validación de duplicidad de Modelos
         Se necesitara previamente un modelo ya registrado`, () => {
    it('Deberia fallar si el dato se repite (Reporte de Error)', () => {
        // 1. Visitamos al lógin
        cy.visit('http://localhost:8080/mantenimientoDeComputo/login.html')
        // 2. Nos logueamos  
        cy.get('#matricula').type('20240989');
        cy.get('#password').type('S4GUNDACUENTAXD');
        cy.get('#btn-entrar').click()
        // 3. Ahora que ya tienes el token, vas al dashboard
        cy.url().should('include', '/dashboard.html');
        // 4. Clic en el menú que dispara cargarVista("usuario.html")
        // Aquí pon el ID o el texto del botón del menú
        cy.get('#btn-menu-modelos').click()
        // 5. Click en el botón que está DENTRO de modelos.html 
        // y que te lleva a "crear-modelo.html"
        // Usamos un timeout porque el JS tarda un poco en inyectar el HTML 
        cy.get('#btn-crear-modelos', { timeout: 5000 }).should('be.visible').click()
        // 6. Ahora ya estás en el formulario final 
        // Buscamos el input dentro del container "contenido-principal"
        cy.get('#contenido-principal #nuevoNombreModelo').clear().type('MSI Vector 16 HX AI');
        cy.get('#contenido-principal #selectMarca').select('7');
        // 7. Intentar guardar para ver el fallo si lo hay  (Caja Negra)
        cy.get('#btnGuardarModelo').click()
        // Aquí es donde documentamos el error que encontraste si hay 
        cy.get('#form-crear-modelo', { timeout: 5000 }).should('be.visible')
        // 8. ¡IMPORTANTE! detener para que Cypress no intente nada más
        // Si el bug existe y el sistema NO da error, Cypress fallará aquí (y esa es tu prueba)
        cy.contains('El modelo ya existe').should('be.visible')
    })
})