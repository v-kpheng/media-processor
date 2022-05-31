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
    cy.intercept('POST', "https://hlg.tokbox.com/prod/logging/vcp_webrtc", (req) => {
        if ((req.body.variation.indexOf('Create') > -1) && (req.body.action.indexOf('MediaProcessor') > -1)){
            req.alias = "MediaProcessorCreate";
        }else if ((req.body.variation.indexOf('Create') > -1) && (req.body.action.indexOf('MediaTransformer') > -1)){
            req.alias = "MediaTransformerCreate";
        } else if (req.body.variation.indexOf('Update') > -1) {
            req.alias = "MediaProcessorUpdate";
        } else if (req.body.variation.indexOf('QoS') > -1){
            req.alias = "MediaTransformerQos";
        } else if ((req.body.variation.indexOf('Delete') > -1) && (req.body.action.indexOf('MediaTransformer') > -1)){
            req.alias = "MediaTransformerDelete";
        } else if ((req.body.variation.indexOf('Delete') > -1) && (req.body.action.indexOf('MediaProcessor') > -1)){
            req.alias = "MediaProcessorDelete";
        }
        req.reply({statusCode: 200})
    })
})

Cypress.Commands.add('configTest', (variation, time) => { 
    cy.wait(1000)
    cy.get('#trasformersCount').select(variation, { force: true });
    cy.get('#testruntime').select(time, { force: true });
    cy.get('#sourceSelector').select('Image', { force: true });
})

Cypress.Commands.add('snapAndRun', (variation, platform) => {
    cy.wait(500);
    cy.get('#outputVideoContainer > .video').then(($output) => {
        cy.get($output).should('be.visible');
        cy.wait(500);
        cy.get($output).matchImageSnapshot(variation+'_'+platform, {capture: 'viewport'}); // test transformed output matches to the saved output image
    })
    if (platform === 'osx'){
        cy.wait(31000);
    } else {
        cy.wait(29000);
    }
    cy.get('#outputVideoContainer > .video').then(($output) => {
        cy.wait(500);
        cy.get($output).matchImageSnapshot('source_'+platform, {capture: 'viewport'}); // test after we destroy the transformer it matches the source image 
    })
    cy.wait(3000);
})

Cypress.Commands.add('switchSnapAndRun', (variation, platform) => {
    cy.get('#outputVideoContainer > .video').then(($output) => {
        cy.get($output).should('be.visible');
        cy.wait(500);
        cy.get($output).matchImageSnapshot(variation+'_'+platform, {capture: 'viewport'}); // test transformed output matches to the saved output image
    })
    cy.wait(5000);
    cy.get('#switchSource').click();
    cy.get('#outputVideoContainer > .video').then(($output) => {
        cy.get($output).should('be.visible');
        cy.wait(500);   
        cy.get($output).matchImageSnapshot(variation+'^_'+platform, {capture: 'viewport'}); // test transformed output matches to the saved output image after the switch
    })
    cy.wait(5000);
    cy.get('#switchSource').click();
    cy.get('#outputVideoContainer > .video').then(($output) => {
        cy.get($output).should('be.visible');
        cy.wait(500);
        cy.get($output).matchImageSnapshot(variation+'_'+platform, {capture: 'viewport'}); // test transformed output matches to the saved output image after the switch
    })
    cy.wait(22000);
})

// check if the correct telemetries were sent 
Cypress.Commands.add('telemetryCheck', (transformers_count) => {
if (transformers_count === '1'){
    cy.get('@MediaProcessorCreate.all').should('have.length', 1);
    cy.get('@MediaTransformerCreate.all').should('have.length', 1);
    cy.get('@MediaProcessorUpdate.all').should('have.length', 1);
    cy.get('@MediaTransformerDelete.all').should('have.length', 1);
    cy.get('@MediaProcessorDelete.all').should('have.length', 1);
}
if (transformers_count === '2'){
    cy.get('@MediaProcessorCreate.all').should('have.length', 1);
    cy.get('@MediaTransformerCreate.all').should('have.length', 2);
    cy.get('@MediaProcessorUpdate.all').should('have.length', 1);
    cy.get('@MediaTransformerDelete.all').should('have.length', 2);
    cy.get('@MediaProcessorDelete.all').should('have.length', 1);
}
if (transformers_count === '3'){
    cy.get('@MediaProcessorCreate.all').should('have.length', 1);
    cy.get('@MediaTransformerCreate.all').should('have.length', 3);
    cy.get('@MediaProcessorUpdate.all').should('have.length', 1);
    cy.get('@MediaTransformerDelete.all').should('have.length', 3);
    cy.get('@MediaProcessorDelete.all').should('have.length', 1);
}
})

// intercept a certain error telemetry 
Cypress.Commands.add('catchErrorTelemetry', (error_message, alias) => {
    cy.intercept('POST', "https://hlg.tokbox.com/prod/logging/vcp_webrtc", (req) => {
        if (req.body.variation.indexOf('Error') > -1 && req.body.message.indexOf(error_message) > -1){
            req.alias = alias;
        }
    })
})
