import Pipeline from './pipeline'
import { Key } from '../telemetry/Key'
import { Report, ReportBuilder, Reporter } from '../telemetry/Reporter';
import { v4 as uuid } from 'uuid';

/**
 * Media processor class holding and running the media processing logic.
 *
 * @example
 *
 * ```ts
 *   let mediaProcessor: MediaProcessor = new MediaProcessor();
 *   let transformers: Array<Transformer> = [];
 *   transformers.push(new CanvasTransform());
 *   mediaProcessor.setTransformers(transformers);
 * ```
 */
class MediaProcessor {
  /**
   * @private
   */
  uuid_: string;
  /**
   * @private
   */
   pipeline_!: Pipeline;
  /**
   * @private
   */
   transformers_!: Array<Transformer>;
  /**
   * @private
   */
   readable_!: ReadableStream;
  /**
   * @private
   */
   writable_!: WritableStream;

  constructor () {
    this.uuid_ = uuid();
    const report: Report = new ReportBuilder()
      .action('MediaProcessor')
      .guid(this.uuid_)
      .variation('Create')
      .build();
    Reporter.report(report);
  }

  /**
   * Starts running the tranformation logic performed by the media processor instance.
   *
   * @param readable Readable stream associated to the media source being processed.
   * @param writable Writable stream associated to the resulting media once processed.
   */
  transform (
    readable: ReadableStream,
    writable: WritableStream
  ): Promise<void> {
    this.readable_ = readable
    this.writable_ = writable
    return this.transformInternal()
  }

  /**
   * @private
   */
  transformInternal (): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (!this.transformers_ || this.transformers_.length === 0) {
        const report: Report = new ReportBuilder()
          .action('MediaProcessor')
          .guid(this.uuid_)
          .message(Key.errors['transformer_none'])
          .variation('Error')
          .build();
        Reporter.report(report);
        reject('[MediaProcessor] Need to set transformers.')
      }

      if (this.pipeline_) {
        this.pipeline_.destroy()
      }

      this.pipeline_ = new Pipeline(this.transformers_)
      this.pipeline_.start(this.readable_, this.writable_).then(() => {
        resolve()
      })
      .catch(e => {
        reject(e)
      })
    })
  }

  /**
   * Sets an array of transfromer instances that will be hold and ran by the media processor instance.
   *
   * @param transformers An array of transformer instances.
   */
  setTransformers (transformers: Array<Transformer>): Promise<void> {
    const report: Report = new ReportBuilder()
      .action('MediaProcessor')
      .guid(this.uuid_)
      .message(Key.updates['transformer_new'])
      .variation('Update')
      .build();
    Reporter.report(report);
    this.transformers_ = transformers
    if (this.readable_ && this.writable_) {
      return this.transformInternal()
    }
    return Promise.resolve()
  }

  /**
   * Stops running the tranformation logic performed by the media processor instance.
   */
  destroy(): Promise<void> {
    return new Promise<void>(resolve => {
      if (this.pipeline_) {
        this.pipeline_.destroy()
      }
      const report: Report = new ReportBuilder()
        .action('MediaProcessor')
        .guid(this.uuid_)
        .variation('Delete')
        .build();
      Reporter.report(report);
      resolve()
    })
  }
}

export default MediaProcessor