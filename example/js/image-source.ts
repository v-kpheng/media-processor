import { MediaProcessorConnectorInterface } from '../../lib/main'
import VideoMirrorHelper from './video-mirror-helper.js'
import VideoSink from './video-sink.js';

class ImageSource {
  videoMirrorHelper_: VideoMirrorHelper;
  stream_: MediaStream;
  mediaProcessorConnector_: MediaProcessorConnectorInterface
  sink_: VideoSink
  videoTrack_: MediaStreamTrack
  imageCanvas1_: HTMLCanvasElement
  imageCanvas2_: HTMLCanvasElement
  static imageCtx1_: CanvasRenderingContext2D
  static sourceImage1_ = new Image()
  static imageCtx2_: CanvasRenderingContext2D
  static sourceImage2_ = new Image()
  switchCounter: number = 0
  static currentAnimation: number = 0

  loading1 = new Promise(resolve => {
    ImageSource.sourceImage1_.src = 'images/background1.jpg'
    ImageSource.sourceImage1_.height = 480
    ImageSource.sourceImage1_.width = 640
    ImageSource.sourceImage1_.addEventListener('load', () => resolve(ImageSource.sourceImage1_));
  });

  loading2 = new Promise(resolve => {
    ImageSource.sourceImage2_.src = 'images/background2.jpg'
    ImageSource.sourceImage2_.height = 480
    ImageSource.sourceImage2_.width = 640
    ImageSource.sourceImage2_.addEventListener('load', () => resolve(ImageSource.sourceImage2_));
  });

  constructor() {
    this.videoMirrorHelper_ = new VideoMirrorHelper();
    this.videoMirrorHelper_.setVisibility(true);
    this.stream_ = null;
    this.sink_ = new VideoSink();
    this.videoTrack_ = null;
    this.imageCanvas1_ = document.createElement('canvas')
    this.imageCanvas1_.width = 640
    this.imageCanvas1_.height = 480
    ImageSource.imageCtx1_ = this.imageCanvas1_.getContext('2d')
    this.imageCanvas2_ = document.createElement('canvas')
    this.imageCanvas2_.width = 640
    this.imageCanvas2_.height = 480
    ImageSource.imageCtx2_ = this.imageCanvas2_.getContext('2d')
  }

  static step1(timestamp: number) {
    ImageSource.imageCtx1_.drawImage(ImageSource.sourceImage1_, 0, 0, 640, 480);
    ImageSource.currentAnimation = window.requestAnimationFrame(ImageSource.step1)
  }

  static step2(timestamp: number) {
    ImageSource.imageCtx2_.drawImage(ImageSource.sourceImage2_, 0, 0, 640, 480);
    ImageSource.currentAnimation = window.requestAnimationFrame(ImageSource.step2)
  }
  
  async init() {
    await this.loading1;
    await this.loading2;
    
  }

  setMediaProcessorConnector(mediaProcessorConnector: MediaProcessorConnectorInterface): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      window.cancelAnimationFrame(ImageSource.currentAnimation);
      if(this.switchCounter % 2 == 0){
        console.log("loading background1");
        this.stream_ = this.imageCanvas1_.captureStream(25);
        this.videoTrack_ = this.stream_.getVideoTracks()[0]
        this.videoMirrorHelper_.destroy()
        this.videoMirrorHelper_.setStream(this.stream_);
        window.requestAnimationFrame(ImageSource.step1)
      }else{
        console.log("loading background2");
        this.stream_ = this.imageCanvas2_.captureStream(25);
        this.videoTrack_ = this.stream_.getVideoTracks()[0]
        this.videoMirrorHelper_.destroy()
        this.videoMirrorHelper_.setStream(this.stream_);
        window.requestAnimationFrame(ImageSource.step2)
      }
      this.switchCounter++;
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
  setInvalidTrack(mediaProcessorConnector: MediaProcessorConnectorInterface): Promise<void> {
    return new Promise<void>(async (resolve, reject) => {
      window.cancelAnimationFrame(ImageSource.currentAnimation);
      if(this.switchCounter % 2 == 0){
        console.log("loading background1");
        this.stream_ = this.imageCanvas1_.captureStream(25);
        this.videoTrack_ = this.stream_.getVideoTracks()[4]
        this.videoMirrorHelper_.destroy()
        this.videoMirrorHelper_.setStream(this.stream_);
        window.requestAnimationFrame(ImageSource.step1)
      }else{
        console.log("loading background2");
        this.stream_ = this.imageCanvas2_.captureStream(25);
        this.videoTrack_ = this.stream_.getVideoTracks()[4]
        this.videoMirrorHelper_.destroy()
        this.videoMirrorHelper_.setStream(this.stream_);
        window.requestAnimationFrame(ImageSource.step2)
      }
      this.switchCounter++;
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
        console.error(e.message)
        reject(e)
      })
    });
  }
  
  
  isSwitchSupported() :boolean{
    return true;
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