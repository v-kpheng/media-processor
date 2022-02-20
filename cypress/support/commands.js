// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

import { addMatchImageSnapshotCommand } from 'cypress-image-snapshot/command';

addMatchImageSnapshotCommand();

Cypress.Commands.add('configAndRun', (transformer, time ) => {
    cy.get('#trasformersCount').select(transformer);
    cy.get('#testruntime').select(time);
    cy.get('#sourceSelector').select('Camera');
    cy.get('.sourceVideo').as('source').should('be.visible').and('have.class', 'video sourceVideo').and('have.css', 'margin', '0px 20px 20px 0px');
    cy.get('#outputVideoContainer > .video').as('output').should('be.visible').and('have.class','video sinkVideo').and('have.css', 'margin', '0px 0px 20px');
})

