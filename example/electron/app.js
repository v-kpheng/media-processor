const electron = require('electron');
const { globalShortcut, webContents } = require('electron')
const os = require('os')
const { v4: uuidv4 } = require('uuid');
const fse = require('fs-extra')

const testResultsPath = './test_results'
const dbName = `${testResultsPath}/${uuidv4()}.json`

const cpuCount = os.cpus().length
let cpuArray = {};

// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let testName_ = null;


const writeDB = async (data) => {
  console.log('writeDB:', data);
  let jsonObj = [];
  await fse.ensureDir(testResultsPath);
  await fse.readJson(dbName).then( obj =>{
    jsonObj = obj;
  })
  .catch(e =>{
  })
  
  jsonObj.push(data)
  await fse.writeJson(dbName, jsonObj)
  .then(() => {
    console.log('save success!')
  })
  .catch(err => {
    console.error(err)
  })
}

const createWindow = async () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({show: false});
  mainWindow.webContents.openDevTools();
  mainWindow.maximize();
  mainWindow.show();

  // and load the index.html of the app.
  mainWindow.loadURL('http://localhost:3000/');

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  globalShortcut.register('CommandOrControl+R', function() {
		mainWindow.reload()
	})

  mainWindow.webContents.on('dom-ready',async () => {
    let dbJson = {id: uuidv4()};
    dbJson.testName = testName_;
    let shouldSave = false;
    for(key in cpuArray){
      shouldSave = true
      let totalCpu = 0.0
      for(cpu of cpuArray[key].cpu){
        totalCpu += cpu;
      }
      totalCpu /= cpuArray[key].cpu.length
      cpuArray[key].totalCpu = totalCpu
      dbJson[`${key}_${cpuArray[key].type}`] = totalCpu;
    }
    cpuArray = {}
    testName_ = null
    if(shouldSave){
      await writeDB(dbJson)
    }
  });
  
  mainWindow.webContents.on('page-title-updated', (event, title, explicitSet) => {
    if(title.startsWith('db_')){
      console.log(title);
      testName_ = title;
    }
  })
};


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

const compute = async () => {
  if(testName_ === null){
    return
  }
  let metrics = await app.getAppMetrics()
  for(metric of metrics){
    let cpu = metric['cpu'].percentCPUUsage * cpuCount
    if(cpuArray[metric.pid] === undefined){
      cpuArray[metric.pid] = {}
      cpuArray[metric.pid].type = metric.name === 'Video Capture' ? 'capture' : metric.type
      cpuArray[metric.pid].cpu = []
    }
    if(metric.cpu.percentCPUUsage > 0 || metric.type === 'Utility'){
      cpuArray[metric.pid].cpu.push(metric.cpu.percentCPUUsage * cpuCount)
    }
  }
}

// Compute statistics every second:
const CpuInterval = async (time) => {
  setTimeout(async () => {
    await compute()
    CpuInterval(time)
  }, time)
}

CpuInterval(5000)
