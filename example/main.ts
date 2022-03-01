import CameraSource from './js/camera-source';
import CanvasTransform from './js/canvas-transform';
import EmptyTransformer from './js/empty-transform';
import TextTransformer from './js/text-transform';

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
  const tranfromersCountSelector: any = document.getElementById('trasformersCount');
  
  let source_: any;
  async function updatePipelineSource() {
    const sourceType = sourceSelector.options[sourceSelector.selectedIndex].value;
    const testruntimeType = testruntimeSelector.options[testruntimeSelector.selectedIndex].value;
    const trasformersCountType = tranfromersCountSelector.options[tranfromersCountSelector.selectedIndex].value;

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
    //this is how we build transformers.
    let mediaProcessor: MediaProcessor = new MediaProcessor();
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


    //this function should be tested.
    mediaProcessor.setTransformers(transformers);

    //use this lines as they are now
    let connector: MediaProcessorConnector = new MediaProcessorConnector(mediaProcessor);
    source_.setMediaProcessorConnector(connector);

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
