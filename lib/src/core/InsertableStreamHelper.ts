class InsertableStreamHelper {
  processor_: any;
  generator_: any;

  constructor(){
    this.processor_= null;
    this.generator_ = null;
  }
  
  async init(track: MediaStreamTrack) {
    try {
      this.processor_ = new MediaStreamTrackProcessor(track);
    } catch (e) {
      alert(`[InsertableStreamHelper] MediaStreamTrackProcessor failed: ${e}`);
      throw e;
    }
    try {
      this.generator_ = new MediaStreamTrackGenerator(track.kind);
    } catch (e) {
      alert(`[InsertableStreamHelper] MediaStreamTrackGenerator failed: ${e}`);
      throw e;
    }   
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
