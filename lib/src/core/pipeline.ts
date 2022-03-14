import { Key } from '../telemetry/Key';
import { Report, ReportBuilder, Reporter } from '../telemetry/Reporter';
import { v4 as uuid } from 'uuid';
import Emittery from 'emittery'
import { getErrorMessage } from '../utils/Tools';

/**
 * WarningType specifies the type of warning from the transformer
 */
export enum WarningType {
  /**
   * Warning about change in process rate
   */
  FPS_DROP = 'fps_drop'
}

/**
 * DropInfo gives info about the frame rate of the transformer
 */
export type DropInfo = {
  /**
   * The rate predicted rate of the track
   */
  requested: number
  /**
   * The actual rate of the track
   */
  current: number
}

/**
 * ErrorFunction specifies the function which the error (exception) happened
 */
export type ErrorFunction = 'start' | 'transform' | 'flush'

/**
 * EventMetaData the meta data of the event.
 */
export type EventMetaData = {
  /**
   * The transformer index in the array of transformers.
   */
  transformerIndex: number
};

/**
 * WarnData the warning data type
 * ```ts
 *  {
 *    eventMetaData: { transformerIndex: 0},
 *    warningType: WarningType.FPS_DROP
 *    dropInfo: {requested: 30, current:20}
 *  }
 * ```
 */
export type WarnData = {
  eventMetaData: EventMetaData
  warningType: WarningType
  dropInfo: DropInfo
}

/**
 * ErrorData the error data type
 * ```ts
 *  {
 *    eventMetaData: { transformerIndex: 0},
 *    ErrorData: 'start',
 *    error: e (the exception in the catch)
 *  }
 * ```
 */
export type ErrorData = {
  eventMetaData: EventMetaData
  function: ErrorFunction
  error: unknown
}

/**
 * EventDataMap the options of event data
 */
export type EventDataMap = {
	warn: WarnData
	error: ErrorData
};

// Note: TELEMETRY_MEDIA_TRANSFORMER_QOS_REPORT_INTERVAL is expresed in frames (frames transformed).
const TELEMETRY_MEDIA_TRANSFORMER_QOS_REPORT_INTERVAL = 500;
const RATE_DROP_TO_PRECENT = 0.8 //80%

class InternalTransformer extends Emittery<EventDataMap> implements Transformer {
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
  trackExpectedRate_: number
  index_:number

  constructor(transformer: Transformer, index: number){
    super()
    this.index_ = index
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
    this.trackExpectedRate_ = -1

    this.transformerType_ = 'Custom';
    if ('getTransformerType' in transformer) {
      this.transformerType_ = (transformer as any).getTransformerType();
    }

    const report: Report = new ReportBuilder()
      .action('MediaTransformer')
      .guid(this.uuid_)
      .transformerType(this.transformerType_)
      .variation('Create')
      .build();
    Reporter.report(report);
  }

  setTrackExpectedRate(trackExpectedRate: number): void{
    this.trackExpectedRate_ = trackExpectedRate
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
          .error(getErrorMessage(e))
          .build();
        Reporter.report(report);
        const msg: ErrorData = {eventMetaData: {transformerIndex: this.index_}, error: e, function: 'start'}
        this.emit('error', msg)
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
            .error(getErrorMessage(e))
            .build();
          Reporter.report(report);
          const msg: ErrorData = {eventMetaData: {transformerIndex: this.index_}, error: e, function: 'transform'}
          this.emit('error', msg)
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
          .message(Key.errors['transformer_flush'])
          .transformerType(this.transformerType_)
          .variation('Error')
          .error(getErrorMessage(e))
          .build();
        Reporter.report(error);
        const msg: ErrorData = {eventMetaData: {transformerIndex: this.index_}, error: e, function: 'flush'}
        this.emit('error', msg)
      }
    }
    this.mediaTransformerQosReport();
    const deleteReport: Report = new ReportBuilder()
      .action('MediaTransformer')
      .guid(this.uuid_)
      .transformerType(this.transformerType_)
      .variation('Delete')
      .build();
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
    if(this.trackExpectedRate_ != -1 && this.trackExpectedRate_ * RATE_DROP_TO_PRECENT > fps){
      const msg: WarnData = {eventMetaData: {transformerIndex: this.index_}, warningType: WarningType.FPS_DROP, dropInfo: {requested: this.trackExpectedRate_, current: fps}}
      this.emit('warn', msg)
    }
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
      .build();
    Reporter.report(qos);
    this.mediaTransformerQosReportStartTimestamp_ = 0;
    this.framesFromSource_ = 0;
    this.framesTransformed_ = 0;
  }
}

class Pipeline extends Emittery<EventDataMap>{
  transformers_: Array<InternalTransformer>
  trackExpectedRate_: number;

  constructor(transformers: Array<Transformer>) {
    super()
    this.transformers_ = [];
    this.trackExpectedRate_ = -1
    for(let index: number = 0; index < transformers.length; index++){
      let internalTransformer: InternalTransformer = new InternalTransformer(transformers[index], index)
      internalTransformer.on('error',(eventData => {
        this.emit('error', eventData)
      }))
      internalTransformer.on('warn', (eventData => {
        this.emit('warn', eventData)
      }))
      this.transformers_.push(internalTransformer)
    }
  }

  setTrackExpectedRate(trackExpectedRate: number): void {
    this.trackExpectedRate_ = trackExpectedRate
    for(let transformer of this.transformers_){
      transformer.setTrackExpectedRate(this.trackExpectedRate_)
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
