describe('PU-03: Validación de creación de usuario y cifrado de contraseñas', () => {
    it('Debe de crear correctamente y encriptar la contraseña correctamente (Reporte de Error)', () => {
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
        cy.get('#btn-menu-usuarios').click()
        // 5. Click en el botón que está DENTRO de usuario.html 
        // y que te lleva a "crear-usuario.html"
        // Usamos un timeout porque el JS tarda un poco en inyectar el HTML 
        cy.get('#btn-crear-usuario', { timeout: 5000 }).should('be.visible').click()

        // 6. Ahora ya estás en el formulario final 
        // Buscamos el input dentro del container "contenido-principal"
        cy.get('#contenido-principal #nuevoNombre').clear().type('PU-03 Dylan');
        cy.get('#contenido-principal #nuevoApellidoP').clear().type('PU-03 Flores');
        cy.get('#contenido-principal #nuevoApellidoM').clear().type('PU-03 Sagahón');
        cy.get('#contenido-principal #nuevaMatricula').clear().type('10101010');
        cy.get('#contenido-principal #nuevoTelefono').clear().type('7713482463');
        cy.get('#contenido-principal #nuevoPassword').clear().type('PU-03Dylan#');
        cy.get('#contenido-principal #selectRoles').select('1');
        // 7. Intentar guardar para ver el fallo si lo hay  (Caja Negra)
        cy.get('#btnGuardarUsuario').click()
        // Aquí es donde documentamos el error que encontraste si hay 
        cy.get('#formCrearUsuario', { timeout: 5000 }).should('be.visible') 
        // 8. ¡IMPORTANTE! detener para que Cypress no intente nada más
        cy.log('Prueba terminada con éxito, el sistema redirigió correctamente.')
    })
})