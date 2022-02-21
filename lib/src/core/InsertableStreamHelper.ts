class InsertableStreamHelper {
  processor_: any;
  generator_: any;

  constructor(){
    this.processor_= null;
    this.generator_ = null;
  }
  
  init(track: MediaStreamTrack): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      try {
        this.processor_ = new MediaStreamTrackProcessor(track);
      } catch (e) {
        console.log(`[InsertableStreamHelper] MediaStreamTrackProcessor failed: ${e}`);
        reject(e)
      }
      try {
        this.generator_ = new MediaStreamTrackGenerator(track.kind);
      } catch (e) {
        console.log(`[InsertableStreamHelper] MediaStreamTrackGenerator failed: ${e}`);
        reject(e)
      }
      resolve()
    })
  }

  getReadable(): ReadableStream {
    return this.processor_.readable;
  }
  
  getWriteable(): WritableStream {
    return this.generator_.writable;
  }

  getProccesorTrack() {
    return this.generator_;
  }
}

export default InsertableStreamHelper;
