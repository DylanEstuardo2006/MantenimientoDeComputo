describe('PU-07: Eliminación definitiva de un dispositivo', () => {
    it('Debería localizar un dispositivo por su nombre y eliminarlo del sistema', () => {
        // --- PASOS DE LOGUEO (Mantenidos igual) ---
        cy.visit('http://localhost:8080/mantenimientoDeComputo/login.html')
        cy.get('#matricula').type('20240989');
        cy.get('#password').type('S4GUNDACUENTAXD');
        cy.get('#btn-entrar').click()
        cy.url().should('include', '/dashboard.html');
        // --- NAVEGACIÓN ---
        cy.get('#btn-menu-equipos').click()
        cy.get("#tabla-dispositivos").should('be.visible');
        // --- PROCESO DE ELIMINACIÓN ---
        // Definimos el nombre al principio para usarlo en toda la prueba
        const dispositivoABorrar = 'LabD4OMENbyHP1'; 
        // 1. Buscamos el registro en la tabla
        cy.contains('td', dispositivoABorrar)
            .parent() // Sube al <tr> (la fila)
            .find('i.bi-trash').parent() // Busca el botón de esa fila
            .click();
        // 2. Interacción con el Modal de Confirmación
        cy.get('#modalEliminarDispositivos', { timeout: 5000 })
            .should('be.visible');
        // 3. Verificación de seguridad en el Modal
        // Validamos que el modal pregunte por el modelo correcto
        cy.get('#nombreDispositivoEliminar').should('contain', dispositivoABorrar);
        // 4. Ejecución de la eliminación
        cy.get('#btnConfirmarBorrado').click();
        // 5. Verificación de Post-condición
        // A. El modal debe cerrarse
        cy.get('#nombreDispositivoEliminar', { timeout: 8000 }).should('not.be.visible');
        // B. Confirmamos que ya no existe en el DOM de la tabla
        // Usamos la misma variable 'dispositivoABorrar' para que no haya errores
        cy.get('#tabla-dispositivos').should('not.contain', dispositivoABorrar);
        
        cy.log(`El dispositivo "${dispositivoABorrar}" fue eliminado exitosamente.`);
    });
});