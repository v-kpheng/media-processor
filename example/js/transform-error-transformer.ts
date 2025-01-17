class TransformTransformer implements Transformer { 
    startCanvas_: any;
    startCtx_: CanvasRenderingContext2D;
    counter_: number = 0; 
    constructor() {
      console.log('empty const');
      this.startCtx_
    }
  
    async start(controller:TransformStreamDefaultController) {
      console.log('text transformer start');
      this.startCanvas_ = new OffscreenCanvas(1, 1)
      this.startCtx_ = this.startCanvas_.getContext('2d')
      if (!this.startCtx_) {
        throw new Error('Unable to create CanvasRenderingContext2D');
      }
    }
  
    transform(frame:any, controller:TransformStreamDefaultController) {
      this.counter_++;
      if (this.counter_ % 100 == 0){
        throw('Cannot transform frame');
      }
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
      console.log('TransformTransformer flush');
    }
  }
  
  export default TransformTransformer;
