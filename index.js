import wbarCApi from './build/wbar.js';
import lodash from 'lodash';

const MAX_WIDTH_RESOLUTION = 4096;
const MAX_HEIGHT_RESOLUTION = 2160;

let buffer;
let isPaused = false;
let canvasDrawingContext;
let wbarApi;
let options;

function wrapWbarCApi() {
  return {
    scan_image: wbarCApi.cwrap('scan_image', 'number', ['number, number, number']),
    init: wbarCApi.cwrap('init', 'number', ['number', 'number']),
    clean_up: wbarCApi.cwrap('clean_up', '', ['number'])
  };
}

function detectSymbols() {

  var start = (new Date).getTime();

  canvasDrawingContext.drawImage(
    options.video, options.scanner_offset_x,
    options.scanner_offset_y,
    options.scanner_width,
    options.scanner_height,
    0,
    0,
    options.scanner_width,
    options.scanner_height,
  );
  const image = canvasDrawingContext.getImageData(0, 0, options.scanner_width, options.scanner_height)
  wbarCApi.HEAP8.set(image.data, buffer);

  var r = wbarApi.scan_image(buffer, image.width, image.height) //in here we might have leak
  console.log(r);

  //wbarApi.destroy_buffer(buffer);
  var stop = (new Date).getTime();

  //console.log(stop - start);

  if(!isPaused) {
    setTimeout(detectSymbols, 0);
  }
}

//TODO lodash in package.json
export default {
  /*
    options:
      video:
      scanner_offset_x:
      scanner_offset_y:
      scanner_width:
      scanner_height:
      benchmarking:
  */
  init: function(opts, callback) {
    options = opts;
    wbarApi = wrapWbarCApi();

    const canvas = document.createElement('canvas');
    canvas.width = options.scanner_width;
    canvas.height = options.scanner_height;
    canvasDrawingContext = canvas.getContext('2d');

    lodash.defaults(options, {'scanner_offset_x':0,
                              'scanner_offset_y': 0});
    //here get width and height from tracks

    buffer = wbarApi.init(options.width, options.height);
    setTimeout(detectSymbols, 0);

    wbarCApi['onDetected'] = callback;
  },
  start: function() {
    isPaused = false;
    setTimeout(detectSymbols, 0);
  },
  pause: function() {
    isPaused = true;
  },
  stop: function() {
    isPaused = true;

  }
}
