import wbarCApi from './build/wbar.js';

const MAX_WIDTH_RESOLUTION = 4096;
const MAX_HEIGHT_RESOLUTION = 2160;

export default {
  init: function(video_id, callback) {
    wbarCApi.onRuntimeInitialized = async _ => {
      const api = {
        scan_image: wbarCApi.cwrap('scan_image', '', ['number, number, number']),
        init: wbarCApi.cwrap('init', '', []),
        cleawn_up: wbarCApi.cwrap('clean_up', '', ['number']),
        create_buffer: wbarCApi.cwrap('create_buffer', 'number', ['number', 'number']),
        destroy_buffer: wbarCApi.cwrap('destroy_buffer', '', ['number']),
      };

      const video = document.getElementById(video_id);
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

      const track = stream.getVideoTracks()[0];
      const actualSettings = track.getSettings();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = actualSettings.width;
      canvas.height = actualSettings.height;
      api.init();

      const timer = setInterval(detectSymbols, 1000 / 30);
    }).catch((e) => {
      throw e
    });

    function detectSymbols() {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const image = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const buffer = api.create_buffer(image.width, image.height);
      wbarCApi.HEAP8.set(image.data, buffer);

      var r = api.scan_image(buffer, canvas.width, canvas.height) //in here we might have leak
      api.destroy_buffer(buffer);
    }
    wbarCApi['onDetected'] = callback;
    }
  },
  start: function() {},
  pause: function() {}
}
