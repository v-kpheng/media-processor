import InsertableStreamHelper from './InsertableStreamHelper';
import { MediaProcessorConnectorInterface } from './MediaProcessorConnectorInterface';
import { MediaProcessorInterface } from './MediaProcessorInterface';

class MediaProcessorConnector implements MediaProcessorConnectorInterface {
  insertableStreamHelper_: InsertableStreamHelper;
  vonageMediaProcessor_: MediaProcessorInterface;

  constructor(vonageMediaProcessor: MediaProcessorInterface) {
    this.insertableStreamHelper_ = new InsertableStreamHelper();
    this.vonageMediaProcessor_ = vonageMediaProcessor;
  }

  setTrack(track: MediaStreamTrack): Promise<MediaStreamTrack> {
      return new Promise<MediaStreamTrack>( (resolve, reject) => {
        this.insertableStreamHelper_.init(track).then( () => {
          this.vonageMediaProcessor_.transform(this.insertableStreamHelper_.getReadable(), this.insertableStreamHelper_.getWriteable())
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


  destroy(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if(this.vonageMediaProcessor_){
        this.vonageMediaProcessor_.destroy().then(() => {
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