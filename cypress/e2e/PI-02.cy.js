describe('PI-02: Asignación correcta de dispositivo con su laboratorio', () => {
    it('Podria fallar si no es correcto la información o el guardado', () => {
        // 1. Visitamos al lógin
        cy.visit('http://localhost:8080/mantenimientoDeComputo/login.html')
        // 2. Nos logueamos  
        cy.get('#matricula').type('20240989');
        cy.get('#password').type('S4GUNDACUENTAXD');
        cy.get('#btn-entrar').click()
        // 3. Ahora que ya tienes el token, vas al dashboard
        cy.url().should('include', '/dashboard.html');
        // 4. Clic en el menú que dispara cargarVista("dispositivos.html")
        // Aquí pon el ID o el texto del botón del menú
        cy.get('#btn-menu-equipos').click()
        // 5. Click en el botón que está DENTRO de dispositivos.html 
        // y que te lleva a "crear-dispositivos.html"
        // Usamos un timeout porque el JS tarda un poco en inyectar el HTML 
        cy.get('#btn-crear-dispositivos', { timeout: 5000 }).should('be.visible').click()

        // 6. Ahora ya estás en el formulario final 
        // Buscamos el input dentro del container "contenido-principal"
        cy.get('#contenido-principal #editarNombreDispositivo').clear().type('LabD1HPPavillion-1');
        cy.get('#contenido-principal #editarNumeroInventario').clear().type('55109283260');
        cy.get('#contenido-principal #selectModelos').select('7');
        cy.get('#contenido-principal #selectTipoDispositivo').select('7');
        // ? Para esta prueba se usara el laboratorio con el id 2  
        cy.get('#contenido-principal #selectLaboratorios').select('2');
        // 7. Intentar guardar para ver el fallo si lo hay  (Caja Negra)
        cy.get('#btnGuardarDispositivo').click()
        // Aquí es donde documentamos el error que encontraste si hay 
        cy.get('#formCrearDispositivo', { timeout: 5000 }).should('be.visible') 
        // 8. ¡IMPORTANTE! detener para que Cypress no intente nada más
        cy.log('Prueba terminada con éxito, el sistema redirigió correctamente y asigno el laboratorio correcto.')
    })
})