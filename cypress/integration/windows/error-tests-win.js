describe('error testing for media proccessor', () => {

    beforeEach(() => {
        cy.visit('/', { onBeforeLoad(win) {
            cy.stub(win.console, 'error').as('consoleError');
            cy.stub(win.console, 'warn').as('consoleWarn');
          },
      })
      cy.on('uncaught:exception', (err, runnable) => {
        return false
      })
    })

    //test pushing 0 transformers error
    it('no transformer', () => {
        cy.catchErrorTelemetry('No transformers provided', 'no_transformer_error');
        cy.configTest('16', '30');
        cy.wait(3000);
        cy.get('@no_transformer_error.all').should('have.length', 1);
        cy.get('@consoleError').should('be.calledWith','[MediaProcessor] Need to set transformers.');
    })
    // test start error 
    it('start error', () => {    
        cy.catchErrorTelemetry('Cannot start transformer', 'start_error');
        cy.configTest('17', '30');
        cy.wait(3000);
        cy.get('@start_error.all').should('have.length', 1);
        cy.get('@consoleError').should('be.calledWith',"Cannot start transformer", 0, "start")
         })
    // test transform error 
    it('transform error', () => {
        cy.catchErrorTelemetry('Cannot transform frame', 'transform_error');
        cy.configTest('18', '30');     
        cy.wait(5000);
        cy.wait('@transform_error');
        cy.get('#outputVideoContainer > .video').then(($output) => {
            cy.get($output).matchImageSnapshot('5_win'); 
        })
        cy.get('@consoleError').should('be.calledWith',"Cannot transform frame", 1, "transform");
    })
    // test flush error 
    it('flush error', () => {
        cy.catchErrorTelemetry('Cannot flush transformer', 'flush_error');
        cy.configTest('19', '30');
        cy.wait(33000);
        cy.get('@flush_error.all').should('have.length', 1);
        cy.get('@consoleError').should('be.calledWith',"Cannot flush transformer", 2, "flush");
    })
    //test set invalid track error
    it('set invalid track', () => {
        cy.configTest('1', '30');
        cy.wait(2000);
        cy.get("#invalidTrack").click()
        cy.wait(2000)
        cy.get('@consoleError').should('be.calledWith',"Failed to construct 'MediaStreamTrackProcessor': The provided value is not of type 'MediaStreamTrackProcessorInit'.");
    })
    // test setTrackExpectedRate 
    it('setTrackExpectedRate within range', () => {
        cy.get('#rate').clear().type('25')
        cy.configTest('1', '30');
        cy.wait(30000);
        cy.get('@consoleWarn').should('not.be.called');
    })
    it('setTrackExpectedRate above range', () => {
        cy.get('#rate').clear().type('50')
        cy.configTest('1', '30');
        cy.wait(30000);
        cy.get('@consoleWarn').should('be.calledWith', 50, 0, 'fps_drop');
        })
    it('setTrackExpectedRate isnt called', () => {
        cy.get('#rate').should('have.value', '-1') 
        cy.configTest('1', '30');
        cy.wait(30000);
        cy.get('@consoleWarn').should('not.be.called');
    })
})