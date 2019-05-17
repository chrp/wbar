import wbarCApi from './build/wbar.js';

const MAX_WIDTH_RESOLUTION = 4096;
const MAX_HEIGHT_RESOLUTION = 2160;
/*
options:
  video_id:
  stream:
  scanner_offset_x:
  scanner_offset_y:
  scanner_width:
  scanner_height:
*/
export default {
  init: function(options, callback) {
    const api = {
      scan_image: wbarCApi.cwrap('scan_image', '', ['number, number, number']),
      init: wbarCApi.cwrap('init', '', []),
      clean_up: wbarCApi.cwrap('clean_up', '', ['number']),
      create_buffer: wbarCApi.cwrap('create_buffer', 'number', ['number', 'number']),
      destroy_buffer: wbarCApi.cwrap('destroy_buffer', '', ['number']),
    };
    if(options.stream === undefined || options.stream === null) {
      const video = document.getElementById(options.video_id); //TODO check first
      //with this the browser will return the highest possible resolution
      const constraints = {
        video: {
          width: MAX_WIDTH_RESOLUTION,
          height: MAX_HEIGHT_RESOLUTION
        }
      };
      navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
        video.srcObject = stream;
        video.play();
        options.stream = stream;
      }
      ).catch((e) => {
        throw e
      });
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const track = options.stream.getVideoTracks()[0];
    const track_settings = track.getSettings();
    api.init();
    setTimeout(detectSymbols, 0);

    function detectSymbols() {
      var start = (new Date).getTime();

      canvas.width = options.scanner_width;
      canvas.height = options.scanner_height;

      ctx.drawImage(
        video, options.scanner_offset_x,
        options.scanner_offset_y,
        canvas.width,
        canvas.height
      );
      const image = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const buffer = api.create_buffer(image.width, image.height);
      wbarCApi.HEAP8.set(image.data, buffer);

      var r = api.scan_image(buffer, image.width, image.height) //in here we might have leak
      api.destroy_buffer(buffer);
      var stop = (new Date).getTime();
      console.log(stop - start);
      setTimeout(detectSymbols, 0);
    }
    wbarCApi['onDetected'] = callback;
  },
  start: function() {},
  pause: function() {}
}