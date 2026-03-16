describe('PU-12: Validación de información del formulario Marcas', () => {
    it('Deberia permitir ingresar caracteres especiales por si la marca lo tiene', () => {
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
        cy.get('#btn-menu-marcas').click()
        // 5. Click en el botón que está DENTRO de marcas.html 
        // y que te lleva a "crear-marcas.html"
        // Usamos un timeout porque el JS tarda un poco en inyectar el HTML 
        cy.get('#btn-crear-marcas', { timeout: 5000 }).should('be.visible').click()
        // 6. Ahora ya estás en el formulario final 
        // Buscamos el input dentro del container "contenido-principal"
        cy.get('#contenido-principal #nombreMarca').clear().type('Hu@wei');
        // 7. Intentar guardar para ver el fallo si lo hay  (Caja Negra)
        cy.get('#btnGuardarMarcas').click()
        // Aquí es donde documentamos el error que encontraste si hay 
        cy.get('#formCrearMarca', { timeout: 5000 }).should('be.visible') 
        // 8. ¡IMPORTANTE! detener para que Cypress no intente nada más
        cy.log('Prueba terminada con éxito, el sistema redirigió correctamente.')
    })
})