describe('CI for media proccessor', () => {

    beforeEach(() => {
        cy.visit('/', { onBeforeLoad(win) {
              cy.stub(win.console, 'log').as('consoleLog')
            },
        })
        cy.window().then(w => w.beforeReload = true)
        cy.window().should('have.prop', 'beforeReload', true)
        // cy.intercept('POST', "https://hlg.dev.tokbox.com/dev/logging/vcp_webrtc", cy.spy().as('telem'));
    })

    afterEach(() => {
        cy.wait(2000)
        cy.window().then(() => {
            cy.window().should('not.have.prop', 'beforeReload') // check the page reloads at the end of the flow 
        })
    })

    it('Canvas Transformer Only', () => {
        cy.telemetryCheck();
        cy.configAndRun('1', '30', '1');
         //check flush function is called
         cy.get('@consoleLog').should('be.calledWith', 'canvas transformer flush');
    })

    it('Empty Transformer only', () => {
        cy.telemetryCheck();
        cy.configAndRun('2', '30', '1');
        cy.get('@consoleLog').should('be.calledWith', 'empty transformer flush');
    })
    
    it('Text Transformer only', () => {
        cy.telemetryCheck();
        cy.configAndRun('3', '30', '1');
        cy.get('@consoleLog').should('be.calledWith', 'text transformer flush');

    })

    it('Canvas -> Empty Transformers', () => {
        cy.telemetryCheck();
        cy.configAndRun('4', '30', '2');
        cy.get('@consoleLog').should('be.calledWith', 'canvas transformer flush').and('be.calledWith', 'empty transformer flush');
    })

    it('Canvas -> Text Transformers', () => {
        cy.telemetryCheck();
        cy.configAndRun('5', '30', '2');
        cy.get('@consoleLog').should('be.calledWith', 'canvas transformer flush').and('be.calledWith', 'text transformer flush');
    })

    it('Empty -> Canvas Transformers', () => {
        cy.telemetryCheck();
        cy.configAndRun('6', '30', '2');
        cy.get('@consoleLog').should('be.calledWith', 'canvas transformer flush').and('be.calledWith', 'empty transformer flush');
    })

    it('Empty -> Text Transformers', () => {
        cy.telemetryCheck();
        cy.configAndRun('7', '30', '2');
        cy.get('@consoleLog').should('be.calledWith', 'empty transformer flush').and('be.calledWith', 'text transformer flush');
    })

    it('Text -> Canvas Transformers', () => {
        cy.telemetryCheck();
        cy.configAndRun('8', '30', '2');
        cy.get('@consoleLog').should('be.calledWith', 'canvas transformer flush').and('be.calledWith', 'text transformer flush');
    })

    it('Text -> Empty Transformers', () => {
        cy.telemetryCheck();
        cy.configAndRun('9', '30', '2');
        cy.get('@consoleLog').should('be.calledWith', 'empty transformer flush').and('be.calledWith', 'text transformer flush');
    })

    it('Canvas -> Empty -> Text Transformers', () => {
        cy.telemetryCheck();
        cy.configAndRun('10', '30', '3');
        cy.get('@consoleLog').should('be.calledWith', 'canvas transformer flush').and('be.calledWith', 'empty transformer flush');
    })

    it('Canvas -> Text -> Empty Transformers', () => {
        cy.telemetryCheck();
        cy.configAndRun('11', '30', '3');
        cy.get('@consoleLog').should('be.calledWith', 'canvas transformer flush').and('be.calledWith', 'text transformer flush');
    })

    it('Empty -> Canvas -> Text Transformers', () => {
        cy.telemetryCheck();
        cy.configAndRun('12', '30', '3');
        cy.get('@consoleLog').should('be.calledWith', 'canvas transformer flush').and('be.calledWith', 'text transformer flush').and('be.calledWith', 'empty transformer flush');
    })

    it('Empty -> Text -> Canvas Transformers', () => {
        cy.telemetryCheck();
        cy.configAndRun('13', '30', '3');
        cy.get('@consoleLog').should('be.calledWith', 'canvas transformer flush').and('be.calledWith', 'text transformer flush').and('be.calledWith', 'empty transformer flush');
    })

    it('Text -> Empty -> Canvas Transformers', () => {
        cy.telemetryCheck();
        cy.configAndRun('14', '30', '3');
        cy.get('@consoleLog').should('be.calledWith', 'canvas transformer flush').and('be.calledWith', 'text transformer flush').and('be.calledWith', 'empty transformer flush');
    })

    it('Text -> Canvas -> Empty Transformers', () => {
        cy.telemetryCheck();
        cy.configAndRun('15', '30', '3');
        cy.get('@consoleLog').should('be.calledWith', 'canvas transformer flush').and('be.calledWith', 'text transformer flush').and('be.calledWith', 'empty transformer flush');
    })

})