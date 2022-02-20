import { MediaProcessorConnectorInterface } from '../../lib/main'
import VideoMirrorHelper from './video-mirror-helper.js'
import VideoSink from './video-sink.js';

class ImageSource {
  videoMirrorHelper_: VideoMirrorHelper;
  stream_: MediaStream;
  mediaProcessorConnector_: MediaProcessorConnectorInterface
  sink_: VideoSink
  videoTrack_: MediaStreamTrack
  imageCanvas_: HTMLCanvasElement
  static imageCtx_: CanvasRenderingContext2D
  static sourceImage_ = new Image()
  
  loading = new Promise(resolve => {
    ImageSource.sourceImage_.src = 'images/background.jpg'
    ImageSource.sourceImage_.height = 480
    ImageSource.sourceImage_.width = 640
    ImageSource.sourceImage_.addEventListener('load', () => resolve(ImageSource.sourceImage_));
  });

  constructor() {
    this.videoMirrorHelper_ = new VideoMirrorHelper();
    this.videoMirrorHelper_.setVisibility(true);
    this.stream_ = null;
    this.sink_ = new VideoSink();
    this.videoTrack_ = null;
    this.imageCanvas_ = document.createElement('canvas')
    this.imageCanvas_.width = 640
    this.imageCanvas_.height = 480
    ImageSource.imageCtx_ = this.imageCanvas_.getContext('2d')
  }

  static step(timestamp: number) {
    ImageSource.imageCtx_.drawImage(ImageSource.sourceImage_, 0, 0, 640, 480);
    window.requestAnimationFrame(ImageSource.step)
  }
  
  async init() {
    await this.loading;
    this.stream_ = this.imageCanvas_.captureStream(25);
    this.videoTrack_ = this.stream_.getVideoTracks()[0]
    this.videoMirrorHelper_.setStream(this.stream_);
    window.requestAnimationFrame(ImageSource.step)
  }

  setMediaProcessorConnector(mediaProcessorConnector: MediaProcessorConnectorInterface): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      this.mediaProcessorConnector_ = mediaProcessorConnector;
      if (!this.stream_) 
      {
        console.log('[CameraSource] Requesting camera.');
        reject("no stream")
      }
      this.mediaProcessorConnector_.setTrack(this.videoTrack_).then( newTrack => {
        let processedStream = new MediaStream();
        processedStream.addTrack(newTrack);
        this.sink_.setMediaStream(processedStream);
        resolve();
      })
      .catch(e => {
        reject(e)
      })
    });
  }

  async stopMediaProcessorConnector() {
    if(this.mediaProcessorConnector_){
      this.mediaProcessorConnector_.destroy().then(() => {
        let processedStream = new MediaStream();
        processedStream.addTrack(this.videoTrack_);
        this.sink_.setMediaStream(processedStream); 
      })
      .catch(e => {
        console.log(e);
      });      
    }
  }

  destroy() {
    console.log('[CameraSource] Stopping camera');
    this.videoMirrorHelper_.destroy();
    if (this.stream_) {
      this.stream_.getTracks().forEach(t => t.stop());
    }
  }
}

export default ImageSource;