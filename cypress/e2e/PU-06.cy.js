describe('PU-06: Prueba de edición de registros correctamente', () => {
    it('Debería editar el nombre del dispositivo y reflejar el cambio en la tabla', () => {
        // 1. Login y Navegación
        cy.visit('http://localhost:8080/mantenimientoDeComputo/login.html');
        cy.get('#matricula').type('20240989');
        cy.get('#password').type('S4GUNDACUENTAXD');
        cy.get('#btn-entrar').click();
        
        cy.url().should('include', '/dashboard.html');
        cy.get('#btn-menu-equipos').click();
        cy.get("#tabla-dispositivos").should('be.visible');

        // 2. Buscar el registro y entrar a Editar
        cy.contains('td', 'LabD1MSIModern156')
            .parent()
            .find('.btn-outline-warning') 
            .click();

        // 3. Esperar carga y llenar el formulario con datos válidos
        cy.get('#editarNombreDispositivo', { timeout: 8000 })
            .should('not.have.value', '')
            .and('have.value', 'LabD1MSIModern156');

        const nuevoNombre = 'LabD1MSIModern156-EDITADO';
        cy.get('#editarNombreDispositivo').clear().type(nuevoNombre);
        
        // Aseguramos que los selects tengan valores válidos para evitar errores de seguridad
        cy.get('#selectTipoDispositivo').select('7');
        cy.get('#selectModelos').select('1');
        cy.get('#selectLaboratorios').select('1');

        // 4. Capturar el Alert usando una aserción de reintento (Should)
        const stub = cy.stub();
        cy.on('window:alert', stub);

        cy.get('#btnActualizarDispositivo').click();

        // Usamos cy.should para que Cypress espere a que el stub reciba el mensaje
        // Esto evita el error "null is not a spy"
        cy.should(() => {
            expect(stub).to.have.been.calledWithMatch(/Dispositivo actualizado correctamente/);
        });

        // 5. Validación final: Verificar que volvimos a la tabla y el nombre cambió
        cy.get('#tabla-dispositivos', { timeout: 10000 }).should('be.visible');
        cy.contains('td', nuevoNombre).should('be.visible');
    });
});