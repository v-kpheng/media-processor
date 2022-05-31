class CanvasTransform{
  static type = "CANVAS";
  constructor() {
    this.canvas_ = null;
    this.ctx_ = null;
    this.use_image_bitmap_ = false;
    this.debugPath_ = 'debug.pipeline.frameTransform_';
  }

  start() {
    console.log('[CanvasTransform] start');
    this.canvas_ = new OffscreenCanvas(1, 1);
    this.ctx_ = /** @type {?CanvasRenderingContext2D} */ (
      this.canvas_.getContext('2d', {alpha: false, desynchronized: true}));
    if (!this.ctx_) {
      throw new Error('Unable to create CanvasRenderingContext2D');
    }
  }

  async transform(frame, controller) {
    const ctx = this.ctx_;
    if (!this.canvas_ || !ctx) {
      frame.close();
      return;
    }
    const width = frame.displayWidth;
    const height = frame.displayHeight;
    this.canvas_.width = width;
    this.canvas_.height = height;
    const timestamp = frame.timestamp;

    if (!this.use_image_bitmap_) {
      try {
        // Supported for Chrome 90+.
        ctx.drawImage(frame, 0, 0);
      } catch (e) {
        // This should only happen on Chrome <90.
        console.log(
            '[CanvasTransform] Failed to draw VideoFrame directly. Falling ' +
                'back to ImageBitmap.',
            e);
        this.use_image_bitmap_ = true;
      }
    }
    if (this.use_image_bitmap_) {
      // Supported for Chrome <92.
      const inputBitmap = await frame.createImageBitmap();
      ctx.drawImage(inputBitmap, 0, 0);
      inputBitmap.close();
    }
    frame.close();

    ctx.shadowColor = '#34ebc3';
    ctx.shadowBlur = 20;
    ctx.lineWidth = 50;
    ctx.strokeStyle = '#34ebc3';
    ctx.strokeRect(0, 0, width, height);

    if (!this.use_image_bitmap_) {
      try {
        // alpha: 'discard' is needed in order to send frames to a PeerConnection.
        controller.enqueue(new VideoFrame(this.canvas_, {timestamp, alpha: 'discard'}));
      } catch (e) {
        // This should only happen on Chrome <91.
        console.log(
            '[CanvasTransform] Failed to create VideoFrame from ' +
                'OffscreenCanvas directly. Falling back to ImageBitmap.',
            e);
        this.use_image_bitmap_ = true;
      }
    }
    if (this.use_image_bitmap_) {
      const outputBitmap = await createImageBitmap(this.canvas_);
      const outputFrame = new VideoFrame(outputBitmap, {timestamp});
      outputBitmap.close();
      controller.enqueue(outputFrame);
    }
  }

  /** @override */
  flush() {
    console.log('canvas transformer flush');
  }
}

export default CanvasTransform;