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
import { platform } from 'os';


addMatchImageSnapshotCommand({
    failureThreshold: 0.03, // threshold for entire image
    failureThresholdType: 'percent', // percent of image or number of pixels
    customDiffConfig: { threshold: 0.1 }, // threshold for each pixel
    capture: 'viewport', // capture viewport in screenshot
  });

Cypress.Commands.add('telemetryIntercept', (num) => {
    cy.intercept('POST', "https://hlg.dev.tokbox.com/dev/logging/vcp_webrtc", (req) => {
        if (req.body.variation.indexOf('Create') > -1){
            req.alias = "create";
        } else if (req.body.variation.indexOf('Update') > -1) {
                req.alias = "update";
        } else if (req.body.variation.indexOf('QoS') > -1){
            req.alias = "qos";
        } else if (req.body.variation.indexOf('Delete') > -1){
            req.alias = "delete";
        } else if (req.body.variation.indexOf('Error') > -1){
            req.alias = "error";
        }
    })
})

Cypress.Commands.add('configTest', (variation, time) => {
    cy.wait(1000)
    cy.get('#trasformersCount').select(variation, { force: true });
    cy.get('#testruntime').select(time, { force: true });
    cy.get('#sourceSelector').select('Image', { force: true });
})

Cypress.Commands.add('snapAndRun', (variation, platform) => {
    cy.get('.sourceVideo').then(($source) => {
        cy.get($source).should('be.visible').and('have.class', 'video sourceVideo').and('have.css', 'margin', '0px 20px 20px 0px');
        cy.wait(200);
        cy.get($source).matchImageSnapshot('source_'+platform, {capture: 'viewport'});
    })
    cy.get('#outputVideoContainer > .video').then(($output) => {
        cy.get($output).should('be.visible').and('have.class','video sinkVideo').and('have.css', 'margin', '0px 0px 20px');
        cy.get($output).matchImageSnapshot(variation+'_'+platform, {capture: 'viewport'}); // test transformed output matches to the saved output image
    })
    cy.wait(33000);
    cy.get('#outputVideoContainer > .video').then(($output) => {
        cy.wait(200);
        cy.get($output).matchImageSnapshot('source_'+platform, {capture: 'viewport'}); // test after we destroy the transformer it matches the source image 
    })
    cy.wait(3000);
})

Cypress.Commands.add('switchSnapAndRun', (variation, platform) => {
    cy.get('.sourceVideo').then(($source) => {
        cy.get($source).should('be.visible').and('have.class', 'video sourceVideo').and('have.css', 'margin', '0px 20px 20px 0px');
        cy.wait(200);
        cy.get($source).matchImageSnapshot('source_'+platform, {capture: 'viewport'});
    })
    cy.get('#outputVideoContainer > .video').then(($output) => {
        cy.get($output).should('be.visible').and('have.class','video sinkVideo').and('have.css', 'margin', '0px 0px 20px');
        cy.get($output).matchImageSnapshot(variation+'_'+platform, {capture: 'viewport'}); // test transformed output matches to the saved output image
    })
    cy.wait(10000);
    cy.get('#switchSource').click();
    cy.get('#outputVideoContainer > .video').then(($output) => {
        cy.get($output).should('be.visible').and('have.class','video sinkVideo').and('have.css', 'margin', '0px 0px 20px');
        cy.wait(200);
        cy.get($output).matchImageSnapshot(variation+'^_'+platform, {capture: 'viewport'}); // test transformed output matches to the saved output image after the switch
    })
    cy.wait(10000);
    cy.get('#switchSource').click();
    cy.get('#outputVideoContainer > .video').then(($output) => {
        cy.get($output).should('be.visible').and('have.class','video sinkVideo').and('have.css', 'margin', '0px 0px 20px');
        cy.wait(200);
        cy.get($output).matchImageSnapshot(variation+'_'+platform, {capture: 'viewport'}); // test transformed output matches to the saved output image after the switch
    })
    cy.wait(13000);
})

// check if the correct telemetries were sent 
Cypress.Commands.add('telemetryCheck', (transformers_count) => {
if (transformers_count === '1'){
    cy.get('@create.all').should('have.length', 2);
    cy.get('@update.all').should('have.length', 1);
    cy.get('@delete.all').should('have.length', 2);
}
if (transformers_count === '2'){
    cy.get('@create.all').should('have.length', 3);
    cy.get('@update.all').should('have.length', 1);
    cy.get('@delete.all').should('have.length', 3); 
}
if (transformers_count === '3'){
    cy.get('@create.all').should('have.length', 4);
    cy.get('@update.all').should('have.length', 1);
    cy.get('@delete.all').should('have.length', 4);  
}
})

// intercept a certain error telemetry 
Cypress.Commands.add('catchErrorTelemetry', (error_message, alias) => {
    cy.intercept('POST', "https://hlg.dev.tokbox.com/dev/logging/vcp_webrtc", (req) => {
        if (req.body.variation.indexOf('Error') > -1 && req.body.message.indexOf(error_message) > -1){
            req.alias = alias;
        }
    })
})
