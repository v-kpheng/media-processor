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

Cypress.Commands.add('telemetryCheck', (num) => {
    cy.intercept('POST', "https://hlg.dev.tokbox.com/dev/logging/vcp_webrtc", (req) => {
        if (req.body.variation.indexOf('Create') > -1){
            req.alias = "create"
        } else if (req.body.variation.indexOf('Update') > -1) {
                req.alias = "update"
        } else if (req.body.variation.indexOf('QoS') > -1){
            req.alias = "qos"
        } else if (req.body.variation.indexOf('Delete') > -1){
            req.alias = "delete"
        } else if (req.body.variation.indexOf('Error') > -1){
            req.alias = "error" 
        }
    })
})

Cypress.Commands.add('configAndRun', (variation, time, transformers_count) => {
    cy.wait(1000)
    cy.get('#trasformersCount').select(variation, { force: true });
    cy.get('#testruntime').select(time, { force: true });
    cy.get('#sourceSelector').select('Image', { force: true });
    cy.get('.sourceVideo').then(($source) => {
        cy.get($source).should('be.visible').and('have.class', 'video sourceVideo').and('have.css', 'margin', '0px 20px 20px 0px');
        cy.wait(100)
        cy.get($source).matchImageSnapshot('source', {capture: 'viewport'})
    })
    cy.get('#outputVideoContainer > .video').then(($output) => {
        cy.get($output).should('be.visible').and('have.class','video sinkVideo').and('have.css', 'margin', '0px 0px 20px');
        cy.get($output).matchImageSnapshot(variation); // test transformed output matches to the saved output image
    })
    cy.wait(33000)
    cy.get('#outputVideoContainer > .video').then(($output) => {
        cy.get($output).matchImageSnapshot('source');
    })
    cy.wait(3000)
// check all telemetries were sent 
    if (transformers_count === '1'){
        cy.get('@create.all').should('have.length', 2)
        cy.get('@update.all').should('have.length', 1)
        cy.get('@delete.all').should('have.length', 2)
    }
    if (transformers_count === '2'){
        cy.get('@create.all').should('have.length', 3)
        cy.get('@update.all').should('have.length', 1)
        cy.get('@delete.all').should('have.length', 3)  
    }
    if (transformers_count === '3'){
        cy.get('@create.all').should('have.length', 4)
        cy.get('@update.all').should('have.length', 1)
        cy.get('@delete.all').should('have.length', 4)   
    }
})

