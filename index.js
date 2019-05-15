import WasmModule from './build/wbar.js';

export default function() {
  WasmModule.onRuntimeInitialized = async _ => {

    // wrap all C functions using cwrap. Note that we have to provide crwap with the function signature.
    const api = {
      scan_image: WasmModule.cwrap('scan_image', '', ['number', 'number', 'number']),
      create_buffer: WasmModule.cwrap('create_buffer', 'number', ['number', 'number']),
      destroy_buffer: WasmModule.cwrap('destroy_buffer', '', ['number']),
    };

    const video = document.getElementById("live");
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext('2d');
    const desiredWidth = 1280;
    const desiredHeight = 720;

    const canvas2 = document.getElementById("cv1");
    const ctx2 = canvas2.getContext('2d');
    ctx2.rect(canvas2.width/2 - 200, canvas2.height/2 - 200, 400, 400);
    ctx2.stroke();

    // settings for the getUserMedia call
    const constraints = {
      video: {
        // the browser will try to honor this resolution, but it may end up being lower.
        width: desiredWidth,
        height: desiredHeight
      }
    };

    // open the webcam stream
    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
      // stream is a MediaStream object
      video.srcObject = stream;
      video.play();

      // tell the canvas which resolution we ended up getting from the webcam
      const track = stream.getVideoTracks()[0];
      const actualSettings = track.getSettings();
      console.log(actualSettings.width, actualSettings.height)
      canvas.width = actualSettings.width;
      canvas.height = actualSettings.height;

      // every k milliseconds, we draw the contents of the video to the canvas and run the detector.
      const timer = setInterval(detectSymbols, 1000 / 30);
      //setInterval(()=>{ctx2.drawImage(video, 0, 0, canvas.width, canvas.height)}, 0);

    }).catch((e) => {
      throw e
    });

    function detectSymbols() {
      // grab a frame from the media source and draw it to the canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // get the image data from the canvas
      const image = ctx.getImageData(0, 0, canvas.width, canvas.height)

      // convert the image data to grayscale
      const grayData = []
      const d = image.data;
      for (var i = 0, j = 0; i < d.length; i += 4, j++) {
        grayData[j] = (d[i] * 66 + d[i + 1] * 129 + d[i + 2] * 25 + 4096) >> 8;
      }

      // put the data into the allocated buffer on the wasm heap.
      const p = api.create_buffer(image.width, image.height);
      Module.HEAP8.set(grayData, p);

      // call the scanner function
      api.scan_image(p, image.width, image.height)

      // clean up
        //(this is not really necessary in this example as we could reuse the buffer, but is used to demonstrate how you can manage Wasm heap memory from the js environment)
      api.destroy_buffer(p);

    }

    // render the string contained in the barcode as text on the canvas
    function renderData(ctx, data, x, y) {
      ctx.font = "15px Arial";
      ctx.fillStyle = "red";
      ctx.fillText(data, x, y);
    }

    // set the function that should be called whenever a barcode is detected
    Module['processResult'] = (symbol, data, polygon) => {
      console.log("Data liberated from WASM heap:")
      console.log(symbol)
      console.log(data)
      console.log(polygon)
      // render the data at the first coordinate of the polygon
      renderData(ctx, data, polygon[0], polygon[1] - 10)
    }
  }
}
