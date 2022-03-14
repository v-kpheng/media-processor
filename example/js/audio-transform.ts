class AudioTransform implements Transformer { 
    lastValuePerChannel: Array<number> = null;
    cutoff = 1000   ;
    constructor() {
    }
  
    async start(controller:TransformStreamDefaultController) {
      
    }
  
    transform(data:any, controller:TransformStreamDefaultController) {
        const format = 'f32-planar'
        const rc = 1.0 / (this.cutoff * 2 * Math.PI);
        const dt = 1.0 / data.sampleRate;
        const alpha = dt / (rc + dt);
        const nChannels = data.numberOfChannels;
        if (!this.lastValuePerChannel) {
          console.log(`Audio stream has ${nChannels} channels.`);
          this.lastValuePerChannel = Array(nChannels).fill(0);
        }
        const buffer = new Float32Array(data.numberOfFrames * nChannels);
        for (let c = 0; c < nChannels; c++) {
          const offset = data.numberOfFrames * c;
          const samples = buffer.subarray(offset, offset + data.numberOfFrames);
          data.copyTo(samples, {planeIndex: c, format});
          let lastValue = this.lastValuePerChannel[c];
    
          // Apply low-pass filter to samples.
          for (let i = 0; i < samples.length; ++i) {
            lastValue = lastValue + alpha * (samples[i] - lastValue);
            samples[i] = lastValue;
          }
    
          this.lastValuePerChannel[c] = lastValue;
        }
        controller.enqueue(new AudioData({
          format,
          sampleRate: data.sampleRate,
          numberOfFrames: data.numberOfFrames,
          numberOfChannels: nChannels,
          timestamp: data.timestamp,
          data: buffer
        }));
    }
  
    flush(controller:TransformStreamDefaultController) {
    }
  }
  
  export default AudioTransform;