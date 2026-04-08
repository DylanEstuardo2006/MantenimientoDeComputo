describe('PA-03:Creación exitosa de una orden de trabajo.', () => {
    it('Debería registrar una orden de trabajo y no fallar', () => {
        // 1. Inicio de Sesión
        cy.visit('http://localhost:8080/mantenimientoDeComputo/login.html');
        cy.get('#matricula').type('20240989');
        cy.get('#password').type('S4GUNDACUENTAXD');
        cy.get('#btn-entrar').click();
        cy.url().should('include', '/dashboard.html');
        // 2. Navegación al módulo de Órdenes
        cy.get('#btn-menu-ordenes', { timeout: 10000 }).should('be.visible').click();
        // 3. Configuración del STUB para capturar el ID de la orden del alert
        cy.window().then((win) => {
            cy.stub(win, 'alert').as('alertStub').callsFake((txt) => {
                // Buscamos el número que viene después del '#' (ej: Orden #25)
                const match = txt.match(/#(\d+)/);
                if (match) {
                    win.idOrdenReciente = match[1]; // Guardamos el ID en la ventana
                }
            });
        });
        // 4. Proceso de Creación
        cy.contains('button', 'Nueva Orden').should('be.visible').click();
        cy.get("#modalCrearOrden").should('be.visible');
        // Seleccionar Laboratorio y esperar carga de dispositivos
        cy.get('#labSelect').select('1'); // ID para Laboratorio D1
        cy.get('#listaDispositivos .device-check', { timeout: 8000 }).should('be.visible');
        // Seleccionamos el primer dispositivo disponible
        cy.get('.device-check').first().check();
        // Click en Crear y validación del alert
        cy.contains('button', 'Crear Orden').click();
        cy.get('@alertStub').should('be.calledWithMatch', /creada correctamente/);
        // 5. BÚSQUEDA DINÁMICA (Aquí es donde evitamos el error de lógica)
        cy.window().then((win) => {
            const idGenerado = win.idOrdenReciente;
            expect(idGenerado).to.not.be.undefined; // Nos aseguramos de tener el ID
            // Esperamos que la lista de órdenes se actualice
            cy.get('#listaOrdenes').should('be.visible');
            // BUSCAMOS LA CARD QUE TENGA EXACTAMENTE NUESTRO ID
            // Esto evita que Cypress haga click en la primera que vea (que podría estar Aceptada)
            cy.contains('.card', `Orden #${idGenerado}`)
                .scrollIntoView()
                .should('be.visible')
                .click();
            // 6. Verificación en el Detalle (Panel Derecho)
            cy.get('#detalleOrden', { timeout: 5000 }).within(() => {
                cy.contains(`Orden #${idGenerado}`).should('be.visible');
                cy.contains('ESPERA').should('be.visible');
                cy.contains('button', 'Registrar Insumos').should('be.visible');
            });
        });
    });
});