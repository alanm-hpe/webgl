let cwidth = 640;
let cheight = 360;
let button;

let tFont = [];

let encoder;

const frate = 30; // frame rate
const numFrames = 100; // num of frames to record
let recording = false;
let recordedFrames = 0;

let count = 0;

function preload() {
    tFont[0] = loadFont("resources/Inter-Medium.ttf");
}

function setup() {
    createCanvas(cwidth, cheight, WEBGL);        // 3D, WEBGL version, does not work
    // createCanvas(cwidth, cheight);                  // 2D version, does work

    runEncoder();

    frameRate(frate)
    button = createButton('record')
    button.mousePressed(() => recording = true)    
}

function draw() {
    background(220)
    textSize(128)
    textAlign(CENTER, CENTER)
    textFont(tFont[0]);
    fill(0);
    text(count, 0, 0);                          // center text in 3D
    // text(count, width/2, height/2)           // center text in 2D
    count++

    // keep adding new frame
    if (recording) {
        console.log('recording')
        encoder.addFrameRgba(drawingContext.getImageData(0, 0, encoder.width, encoder.height).data);        // This seems to be the problem line
        recordedFrames++
    }
    // finalize encoding and export as mp4
    if (recordedFrames === numFrames) {
        recording = false
        recordedFrames = 0
        console.log('recording stopped')

        encoder.finalize()
        const uint8Array = encoder.FS.readFile(encoder.outputFilename);
        const anchor = document.createElement('a')
        anchor.href = URL.createObjectURL(new Blob([uint8Array], { type: 'video/mp4' }))
        anchor.download = encoder.outputFilename
        anchor.click()
        encoder.delete()

        preload() // reinitialize encoder
    }
}

function runEncoder(){
    HME.createH264MP4Encoder().then(enc => {
        encoder = enc
        encoder.outputFilename = 'test'
        encoder.pixelDensity = 2
        encoder.drawingContext = "webgl"
        encoder.width = cwidth * 2
        encoder.height = cheight * 2
        encoder.frameRate = frate
        encoder.kbps = 50000 // video quality
        encoder.groupOfPictures = 10 // lower if you have fast actions.
        encoder.initialize()
    })
}