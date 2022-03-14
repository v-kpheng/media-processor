import CameraSource from './js/camera-source';
import CanvasTransform from './js/canvas-transform';
import { isSupported, MediaProcessor, MediaProcessorConnector, setMetadata, VonageMetadata } from '../lib/main';
import EmptyTransformer from './js/empty-transform';

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
  
  let source_: CameraSource = new CameraSource();
  async function updatePipelineSource() {
    const sourceType = sourceSelector.options[sourceSelector.selectedIndex].value;
    const testruntimeType = testruntimeSelector.options[testruntimeSelector.selectedIndex].value;

    if(sourceType === 'stop'){
      await source_.stopMediaProcessorConnector()
      return;
    }

    const testName: string = "db_canvas_test";
    const metadata: VonageMetadata = {
      appId: 'vonage-media-processor-example',
      sourceType: 'test'
    };
    setMetadata(metadata);
    let mediaProcessor: MediaProcessor = new MediaProcessor();
    
    mediaProcessor.on('error', (eventData => {
      console.error(eventData);
    }))
    mediaProcessor.on('warn', (eventData => {
      console.warn(eventData);
    }))

    let transformers: Array<Transformer> = [];
    transformers.push(new CanvasTransform());
    mediaProcessor.setTransformers(transformers);
    mediaProcessor.setTrackExpectedRate(source_.getMaxFrameRate())

    let connector: MediaProcessorConnector = new MediaProcessorConnector(mediaProcessor);
    source_.setMediaProcessorConnector(connector);

    document.title = testName + `_${testruntimeType}`
    if(testruntimeType != 0){
      setTimeout(async() => {
        await source_.stopMediaProcessorConnector().then(() => {
          setTimeout(() => {
            location.reload();
          }, 1000); 
        })
        .catch(e =>{
          console.log(e);
          setTimeout(() => {
            location.reload();
          }, 1000); 
        })
        
      }, testruntimeType);
    }
  }
  sourceSelector.oninput = updatePipelineSource;
  sourceSelector.disabled = false;
}
window.onload = main;
