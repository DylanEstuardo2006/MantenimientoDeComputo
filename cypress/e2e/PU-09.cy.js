describe(`PU-09: Prueba de edición de registros correctamente`, () => {
    it('Deberia fallar si el modelo no se puede editar', () => {
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
        cy.get('#btn-menu-modelos').click()
        // 5. Click en el botón que está DENTRO de modelos.html 
        cy.get("#tabla-modelos").should('be.visible');
        // y que te lleva a "actualizar-modelo.html"
        // 6. Ahora ya estás en el formulario final 
        // Busca la fila que contiene el texto específico.
        cy.contains('td', 'MSI Vector 16 HX AI')
            .parent() // Se sube a la fila (tr)
            .find('#btn-editar-modelos')
            .click();
        // 7. ESPERA INTELIGENTE
        // Primero: Esperamos que el formulario de actualización sea visible
        cy.get('#form-actualizar-modelo', { timeout: 8000 }).should('be.visible');
        // Segundo: ESPERAMOS a que el input ya no esté vacío. 
        // Esto confirma que el JS ya cargó los datos del ID enviado.
        cy.get('#editNombreModelo', { timeout: 8000 })
            .should('not.have.value', '') // Espera a que no esté vacío
            .and('have.value', 'MSI Vector 16 HX AI'); // Y que tenga el valor original
        // 8. Ahora Sí: Editamos 
        cy.get('#editNombreModelo')
            .clear() // Borramos lo viejo 
            .type('MSI Vector 16 HX AI - EDITADO'); //Escribimos lo nuevo 
        // 9. Guardar Cambios
        cy.get('#btnActualizarModelos').click();
        // 10. Validación final
        cy.contains('Modelo actualizado correctamente').should('be.visible');
        // 3. AHORA, confirma que ya regresaste a la tabla
        // Busca el botón de "Crear" que solo aparece en la vista de la tabla
        cy.get('#btnActualizarModelos', { timeout: 5000 }).should('be.visible')
        // 4. (Opcional) Verifica que el nombre editado aparezca en la tabla
        cy.contains('td', 'MSI Vector 16 HX AI - EDITADO').should('be.visible')
    })
})