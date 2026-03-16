describe('PU-10: Verificación de eliminación lógica y física de Modelos', () => {
    it('Debería localizar un modelo por su nombre y eliminarlo del sistema', () => {
        // --- PASOS DE LOGUEO (Mantenidos igual) ---
        cy.visit('http://localhost:8080/mantenimientoDeComputo/login.html')
        cy.get('#matricula').type('20240989');
        cy.get('#password').type('S4GUNDACUENTAXD');
        cy.get('#btn-entrar').click()
        cy.url().should('include', '/dashboard.html');
        // --- NAVEGACIÓN ---
        cy.get('#btn-menu-modelos').click()
        cy.get("#tabla-modelos").should('be.visible');
        // --- PROCESO DE ELIMINACIÓN ---
        // Definimos el nombre al principio para usarlo en toda la prueba
        const modeloABorrar = 'Nuevo Modelo Test'; 
        // 1. Buscamos el registro en la tabla
        cy.contains('td', modeloABorrar)
            .parent() // Sube al <tr> (la fila)
            .find('i.bi-trash').parent() // Busca el botón de esa fila
            .click();
        // 2. Interacción con el Modal de Confirmación
        cy.get('#modalEliminarModelos', { timeout: 5000 })
            .should('be.visible');
        // 3. Verificación de seguridad en el Modal
        // Validamos que el modal pregunte por el modelo correcto
        cy.get('#nombreModeloEliminar').should('contain', modeloABorrar);
        // 4. Ejecución de la eliminación
        cy.get('#btnConfirmarBorrado').click();
        // 5. Verificación de Post-condición
        // A. El modal debe cerrarse
        cy.get('#modalEliminarModelos', { timeout: 8000 }).should('not.be.visible');
        // B. Confirmamos que ya no existe en el DOM de la tabla
        // Usamos la misma variable 'modeloABorrar' para que no haya errores
        cy.get('#tabla-modelos').should('not.contain', modeloABorrar);
        
        cy.log(`El modelo "${modeloABorrar}" fue eliminado exitosamente.`);
    });
});