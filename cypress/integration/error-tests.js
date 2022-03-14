describe('error testing for media proccessor', () => {

    beforeEach(() => {
        cy.visit('/', { onBeforeLoad(win) {
            cy.stub(win.console, 'log').as('consoleLog')
          },
      })
      cy.on('uncaught:exception', (err, runnable) => {
        return false
      })
    })

    //test pushing 0 transformers error
    it('no transformer', () => {
        cy.intercept('POST', "https://hlg.dev.tokbox.com/dev/logging/vcp_webrtc", (req) => {
            if (req.body.variation.indexOf('Error') > -1 && req.body.message.indexOf('No transformers provided'> -1)){
                req.alias = "no_transformer_error" 
             }
        })
        cy.get('#trasformersCount').select('16', { force: true });
        cy.get('#testruntime').select('30', { force: true });
        cy.get('#sourceSelector').select('Image', { force: true });
        cy.wait(2000)
        cy.get('@no_transformer_error.all').should('have.length', 1);
    })
    // test start error 
    it('start error', () => {
        cy.intercept('POST', "https://hlg.dev.tokbox.com/dev/logging/vcp_webrtc", (req) => {
            if (req.body.variation.indexOf('Error') > -1 && req.body.message.indexOf('Cannot start transformer') > -1){
                req.alias = "start_error" 
             }
        })
        cy.get('#trasformersCount').select('17', { force: true });
        cy.get('#testruntime').select('30', { force: true });
        cy.get('#sourceSelector').select('Image', { force: true });
        cy.wait(3000)
        cy.get('@start_error.all').should('have.length', 1);
    })
    // test transform error 
    it.only('transform error', () => {
        cy.intercept('POST', "https://hlg.dev.tokbox.com/dev/logging/vcp_webrtc", (req) => {
            if (req.body.variation.indexOf('Error') > -1 && req.body.message.indexOf('Cannot transform frame') > -1){
                req.alias = "transform_error" 
             }
        })
        cy.get('#trasformersCount').select('18', { force: true });
        cy.get('#testruntime').select('30', { force: true });
        cy.get('#sourceSelector').select('Image', { force: true });
        cy.wait(5000)
        cy.wait('@transform_error')
        cy.get('#outputVideoContainer > .video').then(($output) => {
            cy.get($output).matchImageSnapshot('3'); // test transformed output matches to the saved output image
        })
    })
    // test flush error 
    it('flush error', () => {
        cy.intercept('POST', "https://hlg.dev.tokbox.com/dev/logging/vcp_webrtc", (req) => {
            if (req.body.variation.indexOf('Error') > -1 && req.body.message.indexOf('Cannot flush transformer') > -1){
                req.alias = "flush_error" 
            }
        })
        cy.get('#trasformersCount').select('19', { force: true });
        cy.get('#testruntime').select('30', { force: true });
        cy.get('#sourceSelector').select('Image', { force: true });
        cy.wait(33000)
        cy.get('@flush_error.all').should('have.length', 1);
    })

})