import { Key } from '../telemetry/Key';
import { Report, ReportBuilder, Reporter } from '../telemetry/Reporter';
import { v4 as uuid } from 'uuid';

// Note: TELEMETRY_MEDIA_TRANSFORMER_QOS_REPORT_INTERVAL is expresed in frames (frames transformed).
const TELEMETRY_MEDIA_TRANSFORMER_QOS_REPORT_INTERVAL = 500;

class InternalTransformer implements Transformer {
  uuid_: string;
  transformerType_: string;
  fps_: number;
  framesTransformed_: number;
  transformer_: Transformer
  shouldStop_: boolean
  isFlashed_: boolean
  framesFromSource_: number;
  mediaTransformerQosReportStartTimestamp_: number;
  videoHeight_: number;
  videoWidth_: number;

  constructor(transformer: Transformer){
    this.uuid_ = uuid();
    this.framesTransformed_ = 0;
    this.transformer_ = transformer;
    this.shouldStop_ = false;
    this.isFlashed_ = false;
    this.framesFromSource_ = 0;
    this.fps_ = 0;
    this.mediaTransformerQosReportStartTimestamp_ = 0;
    this.videoHeight_ = 0;
    this.videoWidth_ = 0;

    this.transformerType_ = 'Custom';
    if ('getTransformerType' in transformer) {
      this.transformerType_ = (transformer as any).getTransformerType();
    }

    const report: Report = new ReportBuilder()
      .action('MediaTransformer')
      .guid(this.uuid_)
      .transformerType(this.transformerType_)
      .variation('Create')
      .build()!;
    Reporter.report(report);
  }

  async start(controller:TransformStreamDefaultController){
    if(this.transformer_ && typeof(this.transformer_.start) === "function"){
      try {
        await this.transformer_.start(controller);
      } catch(e) {
        const report: Report = new ReportBuilder()
          .action('MediaTransformer')
          .guid(this.uuid_)
          .message(Key.errors['transformer_start'])
          .transformerType(this.transformerType_)
          .variation('Error')
          .build()!;
        Reporter.report(report);
      }
    }
  }

  async transform(frame:any, controller:TransformStreamDefaultController) {
    if (this.mediaTransformerQosReportStartTimestamp_ === 0) {
      this.mediaTransformerQosReportStartTimestamp_ = Date.now();
    }
    this.videoHeight_ = frame?.displayHeight ?? 0;
    this.videoWidth_ = frame?.displayWidth ?? 0;
    ++this.framesFromSource_;
    if(this.transformer_){
      if(!this.shouldStop_){
        try {
          await this.transformer_.transform?.(frame, controller);
          ++this.framesTransformed_;
          if (this.framesTransformed_ === TELEMETRY_MEDIA_TRANSFORMER_QOS_REPORT_INTERVAL) {
            this.mediaTransformerQosReport();
          }
        } catch(e) {
          const report: Report = new ReportBuilder()
            .action('MediaTransformer')
            .guid(this.uuid_)
            .message(Key.errors['transformer_transform'])
            .transformerType(this.transformerType_)
            .variation('Error')
            .build()!;
          Reporter.report(report);
        }
      }else{
        frame.close()
        this.flush(controller)
        controller.terminate()
      }
    }
  }

  async flush(controller: TransformStreamDefaultController){
    if(this.transformer_ && typeof(this.transformer_.flush) === "function" && !this.isFlashed_){
      this.isFlashed_ = true
      try {
        await this.transformer_.flush(controller);
      } catch(e) {
        const error: Report = new ReportBuilder()
          .action('MediaTransformer')
          .guid(this.uuid_)
          .message(Key.errors['transformer_transform'])
          .transformerType(this.transformerType_)
          .variation('Error')
          .build()!;
        Reporter.report(error);
      }
    }
    this.mediaTransformerQosReport();
    const deleteReport: Report = new ReportBuilder()
      .action('MediaTransformer')
      .guid(this.uuid_)
      .transformerType(this.transformerType_)
      .variation('Delete')
      .build()!;
    Reporter.report(deleteReport);
  }

  stop(){
    console.log('[Pipeline] Stop stream.');
    this.shouldStop_ = true
  }

  mediaTransformerQosReport(): void {
    let timeElapsed_s = ((Date.now() - this.mediaTransformerQosReportStartTimestamp_) / 1000);
    let fps: number = this.framesFromSource_ / timeElapsed_s;
    let transformedFps: number = this.framesTransformed_ / timeElapsed_s;
    const qos: Report = new ReportBuilder()
      .action('MediaTransformer')
      .fps(fps)
      .transformedFps(transformedFps)
      .framesTransformed(this.framesTransformed_)
      .guid(this.uuid_)
      .transformerType(this.transformerType_)
      .videoHeight(this.videoHeight_)
      .videoWidth(this.videoWidth_)
      .variation('QoS')
      .build()!;
    Reporter.report(qos);
    this.mediaTransformerQosReportStartTimestamp_ = 0;
    this.framesFromSource_ = 0;
    this.framesTransformed_ = 0;
  }
}

class Pipeline {
  transformers_: Array<InternalTransformer>
  constructor(transformers: Array<Transformer>) {
    this.transformers_ = [];
    for(let transformer of transformers){
      this.transformers_.push(new InternalTransformer(transformer))
    }
  }

  async start(readable: ReadableStream, writeable: WritableStream) {
    if (!this.transformers_ || this.transformers_.length === 0) {
      console.log('[Pipeline] No transformers.');
      return;
    }

    try {
      let orgReader:ReadableStream = readable;
      for(let transformer of this.transformers_){
        readable = readable.pipeThrough(new TransformStream(transformer))
      }
      readable.pipeTo(writeable)
      .then(async() => {
        console.log('[Pipeline] Setup.');
        await writeable.abort()
        await orgReader.cancel()
      })
      .catch(async e => {
        readable.cancel().then(() =>{
          console.log('[Pipeline] Shutting down streams after abort.');
        })
        .catch(e => {
          console.error('[Pipeline] Error from stream transform:', e);
        })
        await writeable.abort(e)
        await orgReader.cancel(e)
      });
    } catch (e) {
      this.destroy();
      return;
    }

    console.log('[Pipeline] Pipeline started.')
  }

  async destroy() {
    console.log('[Pipeline] Destroying Pipeline.');
    for(let transformer of this.transformers_){
      transformer.stop();
    }
  }
}

export default Pipeline;
