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

    it('no transformer', () => {
  
          cy.intercept('POST', "https://hlg.dev.tokbox.com/dev/logging/vcp_webrtc", (req) => {
            if (req.body.variation.indexOf('Error') > -1 && expect(req.body).to.include({message:'No transformers provided'})){
                req.alias = "no_transformer_error" 
             }
        })
        cy.get('#trasformersCount').select('16', { force: true });
        cy.get('#testruntime').select('30', { force: true });
        cy.get('#sourceSelector').select('Image', { force: true });
        cy.wait(2000)
        cy.get('@no_transformer_error.all').should('have.length', 1)

    })
})