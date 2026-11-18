// Loaded only by the standalone widget. TizenBrew uses the shared HTML5 player.
(function () {
  'use strict';
  const api = window.webapis && window.webapis.avplay;
  const device = window.tizen && window.tizen.tvinputdevice;
  if (device) {
    ['ChannelUp', 'ChannelDown', 'MediaPlay', 'MediaPause', 'MediaPlayPause', 'MediaStop'].forEach(key => {
      try { device.registerKey(key); } catch (_) { /* Key absent on this remote. */ }
    });
  }
  if (!api) return;

  let generation = 0;
  const modes = ['PLAYER_DISPLAY_MODE_LETTER_BOX', 'PLAYER_DISPLAY_MODE_AUTO_ASPECT_RATIO', 'PLAYER_DISPLAY_MODE_FULL_SCREEN'];
  function close() {
    generation++;
    try { if (api.getState() !== 'NONE') api.close(); } catch (_) { /* Already released. */ }
  }
  window.vistaarPlayer = {
    close,
    aspect(index) { api.setDisplayMethod(modes[index]); },
    control(action) {
      const state = api.getState();
      if (state === 'PLAYING' && action !== 'play') api.pause();
      if (state === 'PAUSED' && action !== 'pause') api.play();
    },
    open(url, aspect, onError) {
      close();
      const request = generation;
      function fail() {
        if (request !== generation) return;
        close();
        onError('The TV could not play this channel. It may be offline or use an unsupported format.');
      }
      try {
        api.open(url);
        api.setListener({ onerror: fail, onstreamcompleted: fail });
        // Samsung uses a 1920 x 1080 coordinate space for full-screen playback.
        api.setDisplayRect(0, 0, 1920, 1080);
        this.aspect(aspect);
        api.prepareAsync(() => {
          if (request !== generation) return;
          try { api.play(); } catch (_) { fail(); }
        }, fail);
      } catch (_) { fail(); }
    }
  };
})();
