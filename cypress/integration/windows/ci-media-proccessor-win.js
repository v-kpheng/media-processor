describe('CI for media proccessor', () => {

    beforeEach(() => {
        cy.visit('/', { onBeforeLoad(win) {
              cy.stub(win.console, 'log').as('consoleLog')
            },
        })
        cy.window().then(w => w.beforeReload = true)
        cy.window().should('have.prop', 'beforeReload', true)
    })

    afterEach(() => {
        cy.wait(2000)
        cy.window().then(() => {
            cy.window().should('not.have.prop', 'beforeReload') // check the page reloads at the end of the flow 
        })
    })

//pushing 1 transformer 

    it('Canvas Transformer Only', () => {
        cy.telemetryIntercept();
        cy.configTest('1', '30');
        cy.snapAndRun('1', 'win');
        cy.telemetryCheck('1');
        cy.get('@consoleLog').should('be.calledWith', 'canvas transformer flush'); //check flush function is called
    })

    it('Empty Transformer only', () => {
        cy.telemetryIntercept();
        cy.configTest('2', '30');
        cy.snapAndRun('2', 'win');
        cy.telemetryCheck('1');
        cy.get('@consoleLog').should('be.calledWith', 'empty transformer flush');
    })
    
    it('Text Transformer only', () => {
        cy.telemetryIntercept();
        cy.configTest('3', '30');
        cy.snapAndRun('3', 'win');
        cy.telemetryCheck('1');
        cy.get('@consoleLog').should('be.calledWith', 'text transformer flush');

    })
//pushing 2 transformers 

    it('Canvas -> Empty Transformers', () => {
        cy.telemetryIntercept();
        cy.configTest('4', '30');
        cy.snapAndRun('4', 'win');
        cy.telemetryCheck('2');
        cy.get('@consoleLog').should('be.calledWith', 'canvas transformer flush').and('be.calledWith', 'empty transformer flush');
    })

    it('Canvas -> Text Transformers', () => {
        cy.telemetryIntercept();
        cy.configTest('5', '30');
        cy.snapAndRun('5', 'win');
        cy.telemetryCheck('2');
        cy.get('@consoleLog').should('be.calledWith', 'canvas transformer flush').and('be.calledWith', 'text transformer flush');
    })

    it('Empty -> Canvas Transformers', () => {
        cy.telemetryIntercept();
        cy.configTest('6', '30');
        cy.snapAndRun('6', 'win');
        cy.telemetryCheck('2');
        cy.get('@consoleLog').should('be.calledWith', 'canvas transformer flush').and('be.calledWith', 'empty transformer flush');
    })

    it('Empty -> Text Transformers', () => {
        cy.telemetryIntercept();
        cy.configTest('7', '30');
        cy.snapAndRun('7', 'win');
        cy.telemetryCheck('2');
        cy.get('@consoleLog').should('be.calledWith', 'empty transformer flush').and('be.calledWith', 'text transformer flush');
    })

    it('Text -> Canvas Transformers', () => {
        cy.telemetryIntercept();
        cy.configTest('8', '30');
        cy.snapAndRun('8', 'win');
        cy.telemetryCheck('2');
        cy.get('@consoleLog').should('be.calledWith', 'canvas transformer flush').and('be.calledWith', 'text transformer flush');
    })

    it('Text -> Empty Transformers', () => {
        cy.telemetryIntercept();
        cy.configTest('9', '30');
        cy.snapAndRun('9', 'win');
        cy.telemetryCheck('2');
        cy.get('@consoleLog').should('be.calledWith', 'empty transformer flush').and('be.calledWith', 'text transformer flush');
    })

//pushing 3 transformers 

    it('Canvas -> Empty -> Text Transformers', () => {
        cy.telemetryIntercept();
        cy.configTest('10', '30');
        cy.snapAndRun('10', 'win');
        cy.telemetryCheck('3');
        cy.get('@consoleLog').should('be.calledWith', 'canvas transformer flush').and('be.calledWith', 'empty transformer flush');
    })

    it('Canvas -> Text -> Empty Transformers', () => {
        cy.telemetryIntercept();
        cy.configTest('11', '30');
        cy.snapAndRun('11', 'win');
        cy.telemetryCheck('3');
        cy.get('@consoleLog').should('be.calledWith', 'canvas transformer flush').and('be.calledWith', 'text transformer flush');
    })

    it('Empty -> Canvas -> Text Transformers', () => {
        cy.telemetryIntercept();
        cy.configTest('12', '30');
        cy.snapAndRun('12', 'win');
        cy.telemetryCheck('3');
        cy.get('@consoleLog').should('be.calledWith', 'canvas transformer flush').and('be.calledWith', 'text transformer flush').and('be.calledWith', 'empty transformer flush');
    })

    it('Empty -> Text -> Canvas Transformers', () => {
        cy.telemetryIntercept();
        cy.configTest('13', '30');
        cy.snapAndRun('13', 'win');
        cy.telemetryCheck('3');
        cy.get('@consoleLog').should('be.calledWith', 'canvas transformer flush').and('be.calledWith', 'text transformer flush').and('be.calledWith', 'empty transformer flush');
    })

    it('Text -> Empty -> Canvas Transformers', () => {
        cy.telemetryIntercept();
        cy.configTest('14', '30');
        cy.snapAndRun('14', 'win');
        cy.telemetryCheck('3');
        cy.get('@consoleLog').should('be.calledWith', 'canvas transformer flush').and('be.calledWith', 'text transformer flush').and('be.calledWith', 'empty transformer flush');
    })

    it('Text -> Canvas -> Empty Transformers', () => {
        cy.telemetryIntercept();
        cy.configTest('15', '30');
        cy.snapAndRun('15', 'win');
        cy.telemetryCheck('3');
        cy.get('@consoleLog').should('be.calledWith', 'canvas transformer flush').and('be.calledWith', 'text transformer flush').and('be.calledWith', 'empty transformer flush');
    })

//switching the source 

    it('switch source with 1 transformer', () => {
        cy.configTest('1', '30');
        cy.switchSnapAndRun('1', 'win')
    })
    it('switch source with 2 transformers', () => {
        cy.configTest('4', '30');
        cy.switchSnapAndRun('4', 'win')
    })
    it('switch source with 3 transformers', () => {
        cy.configTest('15', '30');
        cy.switchSnapAndRun('15', 'win')
    })
})