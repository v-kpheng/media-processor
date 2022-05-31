import { isSupported, MediaProcessor, MediaProcessorConnector, setVonageMetadata, VonageMetadata, ErrorData, WarnData } from '../dist/media-processor.es';
import CameraSource from './js/camera-source';
import CanvasTransform from './js/canvas-transform';
import EmptyTransformer from './js/empty-transform';
import TextTransformer from './js/text-transform';
import ImageSource from './js/image-source';
import StartTransformer from './js/start-error-transformer';
import TransformTransformer from './js/transform-error-transformer';
import FlushTransformer from './js/flush-error-transformer';

async function main() {
  try {
    await isSupported();
  } catch(e) {
    console.log(e);
    alert('Something bad happened: ' + e);
    return;
  }
  
  const sourceSelector: any =document.getElementById('sourceSelector');
  const testruntimeSelector: any = document.getElementById('testruntime');
  const tranfromersCountSelector: any = document.getElementById('trasformersCount');
  const switchSourceSelector: any = document.getElementById('switchSource')
  const expectedRateSelector: any = document.getElementById('rate')
  const invalidTrackSelector: any = document.getElementById('invalidTrack')


  let source_: any;
  async function updatePipelineSource() {
    const sourceType = sourceSelector.options[sourceSelector.selectedIndex].value;
    const testruntimeType = testruntimeSelector.options[testruntimeSelector.selectedIndex].value;
    const trasformersCountType = tranfromersCountSelector.options[tranfromersCountSelector.selectedIndex].value;
    const expectedRateType = expectedRateSelector.value;

    if(sourceType === 'stop'){
      await source_.stopMediaProcessorConnector()
      return;
    } else if(sourceType === 'camera'){
      source_ = new CameraSource()
    }else if(sourceType === 'image'){
      source_ = new ImageSource() 
    }
    await source_.init()
    const testName: string = "db_canvas_test";
    const metadata: VonageMetadata = {
      appId: 'vonage-media-processor-example',
      sourceType: 'test',
      proxyUrl: 'https://ot-test-reverse-proxy.herokuapp.com'
    };
    setVonageMetadata(metadata);
    let mediaProcessor: MediaProcessor = new MediaProcessor();
    
    mediaProcessor.on('error', ((eventData: ErrorData) => {
      console.error(eventData.error, eventData.eventMetaData.transformerIndex, eventData.function);
    }))
 
    mediaProcessor.on('warn', ((eventData: WarnData) => {
      console.warn(eventData.dropInfo.requested, eventData.eventMetaData.transformerIndex, eventData.warningType);
    }))

    if(expectedRateType != "-1"){
      mediaProcessor.setTrackExpectedRate(parseInt(expectedRateType));
    }
    let transformers: Array<Transformer> = [];

    if(trasformersCountType === "1"){
      transformers.push(new CanvasTransform());
    }
    if(trasformersCountType === "2"){
      transformers.push(new EmptyTransformer());
    }
    if(trasformersCountType === "3"){
      transformers.push(new TextTransformer());
    }
    if(trasformersCountType === "4"){
      transformers.push(new CanvasTransform());
      transformers.push(new EmptyTransformer());
    }
    if(trasformersCountType === "5"){
      transformers.push(new CanvasTransform());
      transformers.push(new TextTransformer());
    }
    if(trasformersCountType === "6"){
      transformers.push(new EmptyTransformer());
      transformers.push(new CanvasTransform());
    }
    if(trasformersCountType === "7"){
      transformers.push(new EmptyTransformer());
      transformers.push(new TextTransformer());
    }
    if(trasformersCountType === "8"){
      transformers.push(new TextTransformer());
      transformers.push(new CanvasTransform());
    }
    if(trasformersCountType === "9"){
      transformers.push(new TextTransformer());
      transformers.push(new EmptyTransformer());
    }
    if(trasformersCountType === "10"){
      transformers.push(new CanvasTransform());
      transformers.push(new EmptyTransformer());
      transformers.push(new TextTransformer());
    }
    if(trasformersCountType === "11"){
      transformers.push(new CanvasTransform());
      transformers.push(new TextTransformer());
      transformers.push(new EmptyTransformer());
    }
    if(trasformersCountType === "12"){
      transformers.push(new EmptyTransformer());
      transformers.push(new CanvasTransform());
      transformers.push(new TextTransformer());
    }
    if(trasformersCountType === "13"){
      transformers.push(new EmptyTransformer());
      transformers.push(new TextTransformer());
      transformers.push(new CanvasTransform());
    }
    if(trasformersCountType === "14"){
      transformers.push(new TextTransformer());
      transformers.push(new EmptyTransformer());
      transformers.push(new CanvasTransform());
    }
    if(trasformersCountType === "15"){
      transformers.push(new TextTransformer());
      transformers.push(new CanvasTransform());
      transformers.push(new EmptyTransformer());
    }
    if(trasformersCountType === "16"){
      transformers.push();
    }
    if(trasformersCountType === "17"){
      transformers.push(new StartTransformer());
    }
    if(trasformersCountType === "18"){
      transformers.push(new CanvasTransform());
      transformers.push(new TransformTransformer());
    }
    if(trasformersCountType === "19"){
      transformers.push(new EmptyTransformer());
      transformers.push(new CanvasTransform());
      transformers.push(new FlushTransformer());
    }

    mediaProcessor.setTransformers(transformers);

    //use this lines as they are now
    let connector: MediaProcessorConnector = new MediaProcessorConnector(mediaProcessor);
    try {
      await source_.setMediaProcessorConnector(connector);
    }
    catch(e){
      console.error(e)
    }

    switchSourceSelector.onclick = function(input: any){
      if(typeof source_.isSwitchSupported === 'function' && source_.isSwitchSupported()){
        source_.setMediaProcessorConnector(connector);
      }
    }

    invalidTrackSelector.onclick = function(input: any){
      if(typeof source_.isSwitchSupported === 'function' && source_.isSwitchSupported()){
        source_.setInvalidTrack(connector);
      }
    }

    document.title = testName + `_${testruntimeType}`
    if(testruntimeType != 0){
      setTimeout(async() => {
        //this is how we test the end of the flow.
        await source_.stopMediaProcessorConnector().then(() => {
          setTimeout(() => {
            location.reload();
          }, 5000); 
        })
        .catch(e =>{
          console.log(e);
          setTimeout(() => {
            location.reload();
          }, 5000); 
        })
        
      }, testruntimeType);
    }
  }
  sourceSelector.oninput = updatePipelineSource;
  sourceSelector.disabled = false;
}
window.onload = main;
