describe('PU-05: Validación de campos dispositivos', () => {
    
    it('Debería FALLAR (marcar error) si el sistema acepta caracteres especiales o datos incompletos', () => {
        // 1. Login
        cy.visit('http://localhost:8080/mantenimientoDeComputo/login.html');
        cy.get('#matricula').type('20240989');
        cy.get('#password').type('S4GUNDACUENTAXD');
        cy.get('#btn-entrar').click();    
        // 2. Navegación
        cy.url().should('include', '/dashboard.html');
        cy.get('#btn-menu-equipos').click();
        cy.get('#btn-crear-dispositivos', { timeout: 5000 }).should('be.visible').click();
        // --- PRUEBA DE CARACTERES ESPECIALES ---
        // Ponemos un nombre con símbolos prohibidos para forzar el error
        const nombreInvalido = 'Lab-D1!@#$%^&*'; 
        cy.get('#contenido-principal #editarNombreDispositivo').clear().type(nombreInvalido);
        cy.get('#contenido-principal #editarNumeroInventario').clear().type('55513454391');
        cy.get('#contenido-principal #selectTipoDispositivo').select('7');
        cy.get('#contenido-principal #selectModelos').select('1');
        cy.get('#contenido-principal #selectLaboratorios').select('1');
        // Creamos un "espía" para el alert
        const stub = cy.stub();
        cy.on('window:alert', stub);
        cy.get('#btnGuardarDispositivo').click().then(() => {
            // VERIFICACIÓN: ¿Apareció el mensaje de error de caracteres prohibidos?
            // Si el alert NO aparece o el texto es diferente, Cypress marcará ERROR aquí.
            expect(stub.getCall(0)).to.be.calledWithMatch(/caracteres no permitidos/);
        });

        // 4. VERIFICACIÓN FINAL: El formulario NO debe haberse cerrado
        // Si el sistema es inseguro y guardó, esto fallará porque la URL habrá cambiado
        cy.get('#formCrearDispositivo').should('be.visible');
        
        cy.log('Éxito: El sistema bloqueó correctamente los caracteres especiales.');
    });
});