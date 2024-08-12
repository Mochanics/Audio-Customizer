//Copyright: Mochanics 2023

//500-10000?
//recommended min: 80 Hz
//recommended max: 15000 Hz
//Voice frequency: 85 and 180Hz

//Context array - stores all audio contexts for the page
let contexts = [];

window.onload = () => { //On page load, finds all the video and audio elements and creates the filter for each one of them
    let audios = Array.from(document.getElementsByTagName('audio'));
    let videos = Array.from(document.getElementsByTagName('video'));

    for (let i = 0; i < audios.length; i++) {
        filter(audios[i]);
        
        //Starts the contexts when an audio source plays
        audios[i].onplay = () => {
            for (let i = 0; i < contexts.length; i++) {
                contexts[i].resume();
                contexts[i].destination.channelCount = 1;
                
            }    
        };
    }

    for (let i = 0; i < videos.length; i++) {
        filter(videos[i]);
        
        //Starts the contexts when an video source plays
        videos[i].onplay = () => {
            for (let i = 0; i < contexts.length; i++) {
                contexts[i].resume();
                contexts[i].destination.channelCount = 1;
            }    
        };
    }
};



async function filter(instance) { //Filter creation function
    const enabled = true; //Debug variable - not changed during normal operation
    const voiceBoost = await browser.storage.local.get(["enhancer"]); //Gets the boolean value for whether the voice boost feature is enabled or not
    const context = new AudioContext();
    
    contexts.push(context);
    
    //Creates the daisy-chained lowpass filters
    const lowpass1 = context.createBiquadFilter();
    lowpass1.type = "lowpass";
    const lowpass2 = context.createBiquadFilter();
    lowpass2.type = "lowpass";
    const lowpass3 = context.createBiquadFilter();
    lowpass3.type = "lowpass";
    
    const max_value = await browser.storage.local.get(["max_frequency"]);
    lowpass1.frequency.value = max_value["max_frequency"];
    lowpass2.frequency.value = max_value["max_frequency"];
    lowpass3.frequency.value = max_value["max_frequency"];

    //Creates the daisy-chained highpass filters
    const highpass1 = context.createBiquadFilter();
    highpass1.type = "highpass";
    const highpass2 = context.createBiquadFilter();
    highpass2.type = "highpass";
    const highpass3 = context.createBiquadFilter();
    highpass3.type = "highpass";
    
    const min_value = await browser.storage.local.get(["min_frequency"]);
    highpass1.frequency.value = min_value["min_frequency"];
    highpass2.frequency.value = min_value["min_frequency"];
    highpass3.frequency.value = min_value["min_frequency"];
    
    //Creates the peaking filter, used to boost the typical vocal range frequencies
    const peaking = context.createBiquadFilter();
    peaking.type = "peaking";
    peaking.frequency.value = 132.5;
    peaking.Q.value = 1;
    peaking.gain.value = 25;

    //Connects the filters in order for the given audio context
    if (enabled == true) {
        const source = context.createMediaElementSource(instance);
        
        const mono = await browser.storage.local.get(["mono"]);
        
        if (mono["mono"] == true) {
            context.destination.channelCount = 1;
            console.log("Mono is active");
        } else {
            console.log("Mono is inactive");
        }
        
        source.connect(lowpass1);
        lowpass1.connect(lowpass2);
        lowpass2.connect(lowpass3);
        lowpass3.connect(highpass1);
        highpass1.connect(highpass2);
        highpass2.connect(highpass3);
        
        if (voiceBoost["enhancer"] == true) {
            highpass3.connect(peaking);
            peaking.connect(context.destination);
        } else {
            highpass3.connect(context.destination);
        }
    }
}

//Getting the reset message from the popup.js script (controls the settings). This message is fired every time a plugin setting in changed.
chrome.runtime.onMessage.addListener(msgObj => {
    if (msgObj == "reset") {
        reset();
    }
});

//Forced to do this because browsers automatically pause audio contexts without user gestures. Trying to find a workaround but this might work well enough. Might still generate a few console warnings though.
//document.body.onclick = () => {
//    for (let i = 0; i < contexts.length; i++) {
//        contexts[i].resume()
//    }
//}

//Closes and recreates the audio contexts when the user changes a plugin setting from the settings popup
function reset() {
    for (let i = 0; i < contexts.length; i++) {
        contexts[i].close();
    }
    
    contexts = [];
    
    let audios = Array.from(document.getElementsByTagName('audio'));
    let videos = Array.from(document.getElementsByTagName('video'));

    for (let i = 0; i < audios.length; i++) {
        filter(audios[i]);
    }

    for (let i = 0; i < videos.length; i++) {
        filter(videos[i]);
    }
}

//USEFUL LINKS:
//https://stackoverflow.com/questions/22233037/how-to-apply-basic-audio-filter-using-javascript
//https://stackoverflow.com/questions/16949768/how-can-i-reduce-the-noise-of-a-microphone-input-with-the-web-audio-api