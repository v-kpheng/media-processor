import Pipeline from './pipeline'
import { Key } from '../telemetry/Key'
import { Report, ReportBuilder, Reporter } from '../telemetry/Reporter';
import { v4 as uuid } from 'uuid';

class MediaProcessor {
  uuid_: string;
  // Application ID and source will be only provided by MediaProcessor telemetry
  // as it seems redundant for MediaTransformer telemetry.
  applicationId_: string;
  source_: string;
  pipeline_: Pipeline
  transformers_: Array<Transformer>
  readable_: ReadableStream
  writable_: WritableStream

  constructor () {
    this.uuid_ = uuid();
    // TODO(jaoo): Figure out where to get these two members below from.
    this.applicationId_ = ''
    this.source_ = ''
    this.pipeline_ = null
    this.transformers_ = null
    this.readable_ = null
    this.writable_ = null
    const report: Report = new ReportBuilder()
      .action('MediaProcessor')
      .guid(this.uuid_)
      .variation('Create')
      .build();
    Reporter.report(report);
  }

  transform (
    readable: ReadableStream,
    writable: WritableStream
  ): Promise<void> {
    this.readable_ = readable
    this.writable_ = writable
    return this.transformInternal()
  }

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