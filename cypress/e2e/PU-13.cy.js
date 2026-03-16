describe('PU-13: Prueba de edición de registros', () => {
    it('Debería editar el nombre de una marca exitosamente', () => {
        // 1. Login
        cy.visit('http://localhost:8080/mantenimientoDeComputo/login.html')
        cy.get('#matricula').type('20240989');
        cy.get('#password').type('S4GUNDACUENTAXD');
        cy.get('#btn-entrar').click()
        cy.url().should('include', '/dashboard.html');
        // 2. Navegación a Marcas
        cy.get('#btn-menu-marcas').click()
        cy.get("#tabla-marcas").should('be.visible');
        // 3. Buscar y Click en Editar
        // Asegúrate de que 'Marca Test' sea lo que realmente dice la tabla inicialmente
        cy.contains('td', 'Marca Test')
            .parent()
            .find('#btn-editar-marcas')
            .click();
        // 4. Esperar carga de datos
        cy.get('#formActualizarMarca', { timeout: 8000 }).should('be.visible');
        cy.get('#editarNombreMarca', { timeout: 8000 })
            .should('not.have.value', '');
        // 5. Editar
        cy.get('#editarNombreMarca')
            .clear()
            .type('Marca Test - Editada'); 
        // 6. Guardar
        cy.get('#btnActualizarMarcas').click();
        // 7. Validaciones Post-Guardado
        // B) Verificar que regresamos a la tabla (Buscamos la tabla, NO el botón de guardar)
        cy.get('#tabla-marcas', { timeout: 8000 }).should('be.visible');
        // C) Confirmar cambio en la tabla
        cy.contains('td', 'Marca Test - Editada').should('be.visible');
    })
})