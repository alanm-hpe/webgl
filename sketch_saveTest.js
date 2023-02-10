let cwidth = 640;
let cheight = 360;
let button;

let tFont = [];

let encoder;

const dimension = "3D";
const frate = 30; // frame rate
const numFrames = 100; // num of frames to record
let recording = false;
let recordedFrames = 0;

let count = 0;

function preload() {
    tFont[0] = loadFont("resources/Inter-Medium.ttf");
}

function setup() {
    if (dimension == '3D') {
        createCanvas(cwidth, cheight, WEBGL);
    } else {
        createCanvas(cwidth, cheight);
    }

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
    if (dimension == '3D') {
        text(count, 0, 0)
    } else {
        text(count, width/2, height/2)
    }
    count++

    // keep adding new frame
    if (recording) {
        console.log('recording')
        if (dimension == '3D') {
            let offscreenCanvas = document.createElement("canvas")
            offscreenCanvas.width = encoder.width
            offscreenCanvas.height = encoder.height
            let ctx = offscreenCanvas.getContext("2d")
            ctx.drawImage(canvas,0,0)
            encoder.addFrameRgba(ctx.getImageData(0, 0, encoder.width, encoder.height).data)
        } else {
            encoder.addFrameRgba(canvas.getContext('2d').getImageData(0, 0, encoder.width, encoder.height).data);
        }
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
        encoder.width = cwidth
        encoder.height = cheight
        encoder.frameRate = frate
        encoder.kbps = 50000 // video quality
        encoder.groupOfPictures = 10 // lower if you have fast actions.
        encoder.initialize()
    })
}
