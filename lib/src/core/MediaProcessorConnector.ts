import InsertableStreamHelper from './InsertableStreamHelper';
import { MediaProcessorConnectorInterface } from './MediaProcessorConnectorInterface';
import { MediaProcessorInterface } from './MediaProcessorInterface';

/**
 * Helper class implementing the media processor connector interface.
 *
 * @example
 *
 * ```ts
 *  let mediaProcessor: MediaProcessor = new MediaProcessor();
 *   let transformers: Array<Transformer> = [];
 *   transformers.push(new CanvasTransform());
 *   mediaProcessor.setTransformers(transformers);
 *
 *   let connector: MediaProcessorConnector = new MediaProcessorConnector(mediaProcessor);
 *   source_.setMediaProcessorConnector(connector);
 *
 *   // ...
 *
 *   setMediaProcessorConnector(mediaProcessorConnector: MediaProcessorConnectorInterface): Promise<void> {
 *     return new Promise<void>(async (resolve, reject) => {
 *       this.mediaProcessorConnector_ = mediaProcessorConnector;
 *       if (!this.stream_)
 *       {
 *         console.log('[CameraSource] Requesting camera.');
 *         reject("no stream")
 *       }
 *       this.mediaProcessorConnector_.setTrack(this.videoTrack_).then(newTrack => {
 *         let processedStream = new MediaStream();
 *         processedStream.addTrack(newTrack);
 *         this.sink_.setMediaStream(processedStream);
 *         resolve();
 *       })
 *       .catch(e => {
 *         reject(e)
 *       })
 *     });
 *   }
 *
 *   // ...
 *
 *   async stopMediaProcessorConnector() {
 *     if(this.mediaProcessorConnector_){
 *       this.mediaProcessorConnector_.destroy().then(() => {
 *         let processedStream = new MediaStream();
 *         processedStream.addTrack(this.videoTrack_);
 *         this.sink_.setMediaStream(processedStream);
 *       })
 *       .catch(e => {
 *         console.error(e);
 *       });
 *     }
 *   }
 * ```
 */
class MediaProcessorConnector implements MediaProcessorConnectorInterface {
  /**
   * @private
   */
  insertableStreamHelper_: InsertableStreamHelper;
  /**
   * @private
   */
   mediaProcessor_: MediaProcessorInterface;

  constructor(vonageMediaProcessor: MediaProcessorInterface) {
    this.insertableStreamHelper_ = new InsertableStreamHelper();
    this.mediaProcessor_ = vonageMediaProcessor;
  }

  /**
   * Sets the media stream track instance to be processed.
   *
   * @param track MeadiaStreamTrack (audio or video) to be processed.
   *
   * @returns Promise<MediaStreamTrack> MeadiaStreamTrack instance already processed.
   */
  setTrack(track: MediaStreamTrack): Promise<MediaStreamTrack> {
      return new Promise<MediaStreamTrack>( (resolve, reject) => {
        this.insertableStreamHelper_.init(track).then( () => {
          this.mediaProcessor_.transform(this.insertableStreamHelper_.getReadable(), this.insertableStreamHelper_.getWriteable())
          .then(() =>{
            resolve(this.insertableStreamHelper_.getProccesorTrack());
          })
          .catch(e => {
            reject(e);
          })
        })
        .catch(e => {
          reject(e);
        })
      })
  }

  /**
   * Stops the media processing being performed.
   */
  destroy(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if(this.mediaProcessor_){
        this.mediaProcessor_.destroy().then(() => {
          resolve();
        })
        .catch(e => {
          reject(e);
        }) 
      }else {
        reject("no processor")
      }
    })
  }
}

export default MediaProcessorConnector;