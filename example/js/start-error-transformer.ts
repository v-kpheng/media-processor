class StartTransformer implements Transformer { 
    startCanvas_: any;
    startCtx_: CanvasRenderingContext2D;
    constructor() {
      console.log('empty const');
      this.startCtx_
    }
  
    async start(controller:TransformStreamDefaultController) {
        throw('Cannot start transformer');
          }
    
    transform(frame:any, controller:TransformStreamDefaultController) {
      this.startCanvas_.width = frame.displayWidth
      this.startCanvas_.height = frame.displayHeight
      let timestamp: number = frame.timestamp
      this.startCtx_.drawImage(frame, 0, 0, frame.displayWidth, frame.displayHeight)
      this.startCtx_.font = "30px Arial";
      this.startCtx_.fillStyle = "black";
      this.startCtx_.fillText("media-proccessor text transformer example", 50, 150);
      frame.close()
      controller.enqueue(new VideoFrame(this.startCanvas_, {timestamp, alpha: 'discard'}));
    }
  
    flush(controller:TransformStreamDefaultController) {
      console.log('StartTransformer flush');
    }
  }
  
  export default StartTransformer;
