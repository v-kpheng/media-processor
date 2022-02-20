describe('CI for media proccessor', () => {

    beforeEach(() => {
        cy.visit('/');
    })

    it('Custom Transformer Only', () => {
        cy.configAndRun('1', '30');
        cy.wait(30000);
    })

    it('Custom & Empty Transformers', () => {
        cy.configAndRun('2', '30');
        cy.wait(30000);
    })
    
    it.only('Custom & Empty & Text Transformers', () => {
        cy.configAndRun('3', '30');
        cy.wait(100).then(() => {
            cy.get('#outputVideoContainer > .video').matchImageSnapshot('new')
        })
        cy.get('#outputVideoContainer > .video').then(($canvas) => {
            
            // var pixel = $canvas.getContext('2d');
            // const canvasWidth = $canvas.width();
            // const canvasheight = $canvas.height();
            // const canvasCenterX = canvasWidth / 2;
            // const canvasCenterY = canvasheight / 2;
            // const X = canvasWidth - 1;
            // const Y = canvasheight - 1;
        })
        cy.wait(30000);
    })
})
