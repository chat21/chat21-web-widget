/*
  (c) Tiledesk SRL 2019
*/

function startSpeechToText(micButton, streamed_callback, final_callback) {
  var micButton = document.getElementById('playbutton');
  console.log("startSpeechToText main " + micButton);
  var myAudioContext;
  var webSocket = null;
  var SAMPLE_RATE = 16000;
  var SAMPLE_SIZE = 16;
  var audioSettings = {
    echoCancellation: true,
    channelCount: 1,
    sampleSize: SAMPLE_SIZE
  };
  var AudioContext = window.AudioContext || window.webkitAudioContext || false;
  if (!AudioContext) {
    alert("Web Audio non disponibile sul tuo browser...");
    return;
  }
  // var micButton = document.getElementById('playbutton');
  myAudioContext = new AudioContext;
  playButtonHandler(micButton)
  micButton.addEventListener('pause', myAudioContext.suspend.bind(myAudioContext));
  micButton.addEventListener('play', myAudioContext.resume.bind(myAudioContext));
  micButton.addEventListener('play', function() {
    navigator.getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
    var getUserMediaSuccess = function(micStream) {
      console.log("getUserMediaSuccess")
      initWebsocket(micStream);
    };
    var getUserMediaError = function() {
      console.error
    };
    if (navigator.mediaDevices.getUserMedia != undefined) {
      navigator.mediaDevices.getUserMedia({
          audio: audioSettings
      }).then(getUserMediaSuccess).catch(getUserMediaError);
    } else {
      navigator.getUserMedia({
          audio: audioSettings
      }, getUserMediaSuccess, getUserMediaError);
    }
  });

  function initWebsocket(micStream) {
    console.log("initWebsocket")
    function newWebsocket() {
      console.log("newWebsocket")
      if (webSocket == null) {
        console.log("hostname " + location.hostname)
        console.log("pathname " + location.pathname)

        var websocket_protocol = location.protocol === "http:" ? "ws:" : "wss:"
        console.log("selected websocket protocol: ", websocket_protocol)
        var _socketUrl = websocket_protocol + "//localhost:3000" ;
        if(location.host.indexOf("localhost") == -1){
          _socketUrl = websocket_protocol + "//" + location.host;
        }
        webSocket = new WebSocket(_socketUrl);
        sourceNode = myAudioContext.createMediaStreamSource(micStream);
        scriptNode = myAudioContext.createScriptProcessor(4096, 1, 1);
        sourceNode.connect(scriptNode);
        scriptNode.connect(myAudioContext.destination);
        webSocket.onclose = function(e) {
          console.log('Websocket closing...');
          micButton.dispatchEvent(new Event('pause'));
        };
        webSocket.onerror = function(e) {
          console.log('Error from websocket', e);
          micButton.dispatchEvent(new Event('pause'));
        };
        webSocket.onmessage = function(e) {
          webSocket.onmessage = onTranscription;
        };
        webSocket.onopen = function(e) {
          if (webSocket.readyState == webSocket.OPEN) webSocket.send(JSON.stringify({
            sampleRate: SAMPLE_RATE,
            languageCode: "it-IT"
          }));
          scriptNode.onaudioprocess = function(e) {
            var floatSamples = e.inputBuffer.getChannelData(0);
            var buffer = downsampleBuffer(floatSamples);
            if (webSocket != null) {
                if (webSocket.readyState == webSocket.OPEN) webSocket.send(buffer);
            }
          };
        };
      }
    }
    function closeWebsocket() {
      if (scriptNode) scriptNode.disconnect();
      if (sourceNode) sourceNode.disconnect();
      if (webSocket && webSocket.readyState === webSocket.OPEN) webSocket.close();
      webSocket = null;
    }
    var toggleWebsocket = function(e) {
      console.log("toggleWebsocket", myAudioContext.state)
      if (myAudioContext.state === 'running') {
        newWebsocket();
      } else if (myAudioContext.state === 'suspended') {
        closeWebsocket();
      }
    }
    function downsampleBuffer(buffer) {
      var MAX_INT = Math.pow(2, 16 - 1) - 1;
      var sampleRateRatio = myAudioContext.sampleRate / SAMPLE_RATE;
      var newLength = Math.round(buffer.length / sampleRateRatio);
      var result = new Int16Array(newLength);
      var offsetResult = 0;
      var offsetBuffer = 0;
      while (offsetResult < result.length) {
        var nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
        var accum = 0, count = 0;
        for (var i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
          accum += buffer[i];
          count++;
        }
        result[offsetResult] = (accum / count) * MAX_INT;
        offsetResult++;
        offsetBuffer = nextOffsetBuffer;
      }
      return result;
    }
    function onTranscription(e) {
        var text = "";
        var data = JSON.parse(e.data);
        var result = data.results[0]
        if (result && result.alternatives) {
            text = result.alternatives[0].transcript;
            if (text.length > 0) {
                console.log("interim transcript: ", text)
                // document.getElementById("transcript").innerHTML = text
                streamed_callback(text)
            }
        }
        if (result && result.isFinal) {
            const final_transcript = text;
            console.log("Final_transcript: " + final_transcript);
            myAudioContext.suspend.bind(myAudioContext)
            closeWebsocket()
            // document.getElementById("transcript").innerHTML = "<b>" + final_transcript + "</b>"
            // sendTextToChatbot(final_transcript);
            final_callback(final_transcript)
        }
    }
    myAudioContext.onstatechange = toggleWebsocket;
    toggleWebsocket({
        target: myAudioContext
    });
  }

  function calculateBufferSize(sampleRate) {
      var samplesPerHundredMilliseconds = parseInt(sampleRate / 10);
      if (samplesPerHundredMilliseconds <= 256) {
          return 256;
      } else if (samplesPerHundredMilliseconds > 256 && samplesPerHundredMilliseconds <= 512) {
          return 512;
      } else if (samplesPerHundredMilliseconds > 512 && samplesPerHundredMilliseconds <= 1024) {
          return 1024;
      } else if (samplesPerHundredMilliseconds > 1024 && samplesPerHundredMilliseconds <= 2048) {
          return 2048;
      } else if (samplesPerHundredMilliseconds > 2048 && samplesPerHundredMilliseconds <= 4096) {
          return 4096;
      } else if (samplesPerHundredMilliseconds > 4096 && samplesPerHundredMilliseconds <= 8192) {
          return 8192;
      } else if (samplesPerHundredMilliseconds > 8192 && samplesPerHundredMilliseconds <= 16384) {
          return 16384;
      }
  }

  function playButtonHandler(micButton) {
    micButton.addEventListener('click', function(e) {
      if (this.classList.contains('playing')) {
        micButton.dispatchEvent(new Event('pause'));
      } else {
        micButton.dispatchEvent(new Event('play'));
        console.log("play added")
      }
    }, true);
    micButton.addEventListener('play', function(e) {
      this.classList.add('playing');
    });
    micButton.addEventListener('pause', function(e) {
      this.classList.remove('playing');
    });
  }
}

// (function playButtonHandler() {
//   var playButton = document.getElementById('playbutton');
//   console.log("added playbotton ", playButton)
//   playButton.addEventListener('click', function(e) {
//       if (this.classList.contains('playing')) {
//           playButton.dispatchEvent(new Event('pause'));
//       } else {
//           playButton.dispatchEvent(new Event('play'));
//           console.log("play added")
//       }
//   }, true);
//   playButton.addEventListener('play', function(e) {
//       this.classList.add('playing');
//   });
//   playButton.addEventListener('pause', function(e) {
//       this.classList.remove('playing');
//   });
// })();