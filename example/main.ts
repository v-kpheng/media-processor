import CameraSource from './js/camera-source';
import CanvasTransform from './js/canvas-transform';
import { isSupported, MediaProcessor, MediaProcessorConnector } from '../lib/main';
import ImageSource from './js/image-source';

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
  const initSourceType = sourceSelector.options[sourceSelector.selectedIndex].value;
  
  let source_: any;
  

  async function updatePipelineSource() {
    const sourceType = sourceSelector.options[sourceSelector.selectedIndex].value;
    const testruntimeType = testruntimeSelector.options[testruntimeSelector.selectedIndex].value;

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
    let mediaProcessor: MediaProcessor = new MediaProcessor();
    let transformers: Array<Transformer> = [];
    transformers.push(new CanvasTransform());
    mediaProcessor.setTransformers(transformers);

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
