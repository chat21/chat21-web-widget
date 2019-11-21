//webkitURL is deprecated but nevertheless
URL = window.URL || window.webkitURL;

var gumStream; 						//stream from getUserMedia()
var recorder; 						//WebAudioRecorder object
var input; 							//MediaStreamAudioSourceNode  we'll be recording
var encodingType; 					//holds selected encoding for resulting audio (file)
var encodeAfterRecord = true;       // when to encode

// shim for AudioContext when it's not avb. 
var AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext; //new audio context to help us record

var encodingTypeSelect = 'wav'; //document.getElementById("encodingTypeSelect");
// var recordButton = document.getElementById("recordButton");
// var stopButton = document.getElementById("stopButton");

//add events to those 2 buttons
// recordButton.addEventListener("click", startRecording);
// stopButton.addEventListener("click", stopRecording);

var baseLocation = '';

function setBaseLocation(baseLocation) {
	this.baseLocation = baseLocation;
	console.log("setBaseLocation:" + baseLocation);
}

function startRecording(urlAudiorepo, uid, callbackEndRecording) {
	console.log("startRecording() called uid: "+ urlAudiorepo);
	/*
		Simple constraints object, for more advanced features see
		https://addpipe.com/blog/audio-constraints-getusermedia/
	*/
    
    var constraints = { audio: true, video: false }

    /*
    	We're using the standard promise based getUserMedia() 
    	https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
	*/

	navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
		console.log("getUserMedia() success, stream created, initializing WebAudioRecorder..."+ uid);
		/*
			create an audio context after getUserMedia is called
			sampleRate might change after getUserMedia is called, like it does on macOS when recording through AirPods
			the sampleRate defaults to the one set in your OS for your playback device

		*/
		audioContext = new AudioContext();

		//update the format 
		// document.getElementById("formats").innerHTML="Format: 2 channel "+encodingTypeSelect.options[encodingTypeSelect.selectedIndex].value+" @ "+audioContext.sampleRate/1000+"kHz"

		//assign to gumStream for later use
		gumStream = stream;
		console.log('gumStream' + gumStream);
		
		/* use the stream */
		input = audioContext.createMediaStreamSource(stream);
		console.log('input' + input);
		
		//stop the input from playing back through the speakers
		//input.connect(audioContext.destination)

		//get the encoding 
		encodingType = encodingTypeSelect; // encodingTypeSelect.options[encodingTypeSelect.selectedIndex].value;
		console.log('encodingType' + encodingType);

		//disable the encoding selector
		// encodingTypeSelect.disabled = true;

		recorder = new WebAudioRecorder(input, {
		  	workerDir: this.baseLocation + "/assets/js/", // "/home/assets/js/" // must end with slash
		  	encoding: encodingType,
		  	numChannels: 2, //2 is the default, mp3 encoding supports only 2
			onEncoderLoading: function(recorder, encoding) {
				// show "loading encoder..." display
				console.log("Loading "+encoding+" encoder...");
			},
			onEncoderLoaded: function(recorder, encoding) {
				// hide "loading encoder..." display
				console.log(encoding+" encoder loaded");
			},
			onEncodingProgress: function (recorder, progress) {
				console.log("progress " + progress);
			}
		});

		recorder.onComplete = function(recorder, blob) { 
			const filename = uid+'__STEREO.'+recorder.encoding;
			console.log("Encoding complete : filename: " + filename);
			// createDownloadLink(blob,recorder.encoding);
			sendaudio(blob, urlAudiorepo, filename, function(val) {
				console.log('callback sendaudio'+urlAudiorepo);
				callbackEndRecording(uid,filename);
			});
			// encodingTypeSelect.disabled = false;
		}
		

		recorder.setOptions({
		  timeLimit: 120,
		  encodeAfterRecord:encodeAfterRecord,
	      ogg: {quality: 0.5},
	      mp3: {bitRate: 160}
	    });

		//start the recording process
		recorder.startRecording();

		console.log("Recording started");

	}).catch(function(err) {
	  	//enable the record button if getUSerMedia() fails
    	// recordButton.disabled = false;
		// stopButton.disabled = true;
		console.log("error: " + err);

	});

	//disable the record button
    // recordButton.disabled = true;
    // stopButton.disabled = false;
}

function stopRecording() {
	console.log("stopRecording() called");
	
	//stop microphone access
	gumStream.getAudioTracks()[0].stop();

	//disable the stop button
	// stopButton.disabled = true;
	// recordButton.disabled = false;
	
	//tell the recorder to finish the recording (stop recording + encode the recorded audio)
	recorder.finishRecording();

	console.log('Recording stopped');
}

// function createDownloadLink(blob,encoding) {
	
// 	var url = URL.createObjectURL(blob);
// 	var au = document.createElement('audio');
// 	var li = document.createElement('li');
// 	var link = document.createElement('a');

// 	//add controls to the <audio> element
// 	au.controls = true;
// 	au.src = url;

// 	//link the a element to the blob
// 	link.href = url;
// 	link.download = new Date().toISOString() + '.'+encoding;
// 	link.innerHTML = link.download;

// 	//add the new audio and a elements to the li element
// 	li.appendChild(au);
// 	li.appendChild(link);

// 	//add the li element to the ordered list
// 	// recordingsList.appendChild(li);
// }

function sendaudio(blob, urlAudiorepo, filename, callbackFunction) {
	let url 
	if(urlAudiorepo.toLowerCase().startsWith("http")){
		url = urlAudiorepo;
	} else {
		url = this.baseLocation+urlAudiorepo;
	}

    var xhr=new XMLHttpRequest();
    // xhr.onload = function(e) {
    //     if(this.readyState === 4) {
    //         console.log("Server returned: ",e.target.responseText);
    //     }
	// };
	xhr.onreadystatechange = function () {
		if(xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
		  callbackFunction(xhr.responseText);
		}
	};
    var fd=new FormData();
    fd.append("audio_data",blob, filename);
    xhr.open("POST", url+"/sendaudiomessage",true);
	xhr.send(fd);
	// send con la callback che ritorna uid msg
  }


