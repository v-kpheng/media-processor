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


addMatchImageSnapshotCommand({
    failureThreshold: 0.03, // threshold for entire image
    failureThresholdType: 'percent', // percent of image or number of pixels
    customDiffConfig: { threshold: 0.01 }, // threshold for each pixel
    capture: 'viewport', // capture viewport in screenshot
  });

// Cypress.Commands.add('waitForTelemetry', (num) => {
//     cy.intercept('POST', "https://hlg.dev.tokbox.com/dev/logging/vcp_webrtc").as('telem');
//     if (num === '3'){
//         cy.wait('@telem').continue 
//         cy.wait('@telem').continue 
//         cy.wait('@telem').continue 
//     }
//     if (num === '2'){
//         cy.wait('@telem').continue 
//         cy.wait('@telem').continue 
//     }
// })

Cypress.Commands.add('configAndRun', (variation, time, transformers_count) => {
    cy.wait(1000)
    cy.get('#trasformersCount').select(variation, { force: true });
    cy.get('#testruntime').select(time, { force: true });
    cy.get('#sourceSelector').select('Image', { force: true });
    cy.get('.sourceVideo').then(($source) => {
        cy.get($source).should('be.visible').and('have.class', 'video sourceVideo').and('have.css', 'margin', '0px 20px 20px 0px');
        cy.wait(200)
        cy.get($source).matchImageSnapshot('source', {capture: 'viewport'})
    })
    cy.get('#outputVideoContainer > .video').then(($output) => {
        cy.get($output).should('be.visible').and('have.class','video sinkVideo').and('have.css', 'margin', '0px 0px 20px');
        cy.get($output).matchImageSnapshot(variation); // test transformed output matches to the saved output image
    })
    cy.wait(35000)
//check all telemetries were sent 
    if (transformers_count === '1'){
        cy.get('@telem.all').its('callCount').should('equal', 6)
    }
    if (transformers_count === '2'){
        cy.get('@telem.all').its('callCount').should('equal', 9)
    }
    if (transformers_count === '3'){
        cy.get('@telem.all').its('callCount').should('equal', 12)
    }
})

