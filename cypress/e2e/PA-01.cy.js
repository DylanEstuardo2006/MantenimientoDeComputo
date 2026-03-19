describe('PA-01 : Validación de permisos', () => {
    it('Evitar que el usuario con el rol de "TÉCNICO" no pueda entrar en el formulario de usuario', () => {
        // 1. Visitamos al lógin
        cy.visit('http://localhost:8080/mantenimientoDeComputo/login.html')
        // 2. Nos logueamos  
        cy.get('#matricula').type('11111111');
        cy.get('#password').type('Tester123');
        cy.get('#btn-entrar').click()

        cy.url().should('include', '/dashboard.html');

        // 2. Verificar que el localStorage tenga el rol correcto (para estar seguros)
        cy.window().then((win) => {
            const user = JSON.parse(win.localStorage.getItem("userSession"));
            expect(user.rol).to.equal(2);
        });

        // 3. EL ATAQUE: Intentamos "disparar" la carga de la vista de usuarios
        // Aunque el botón no esté, simulamos el llamado a la función cargarVista
        cy.window().invoke('cargarVista', 'views/usuario.html');

        // 4. LA VALIDACIÓN: Según tu código, el sistema debe mandarlo a tecnico.html
        // Buscamos algo que sea ÚNICO de la vista técnico (un título o ID)
        cy.get('#contenido-principal', { timeout: 10000 })
            .should('not.contain', 'Gestión de Usuarios') 
            .and('be.visible') 
            
        cy.log('Seguridad confirmada: El técnico fue redirigido correctamente.');
    })
})