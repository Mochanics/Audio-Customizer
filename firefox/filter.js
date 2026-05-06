//Copyright: Mochanics 2026

//recommended min: 80 Hz
//recommended max: 15000 Hz
//Voice frequency: between 85 and 180Hz

//Context array - stores all audio contexts for the page
const elementState = new WeakMap(); //Storing the context and original source for a given element
let mediaElements = []; //Array storing all media elements.

//Guards against window.onload already having fired in Firefox
function onReady(fn) {
    if (document.readyState === 'complete' || document.readyState === 'interactive') { //If the window.onload even has already fired.
        fn(); //Calls the passed anonymous function immediately.
    } else {
        window.addEventListener('load', fn, { once: true }); //Calls the anonymous function when load is fired.
    }
}

//On page load, finds all the video and audio elements and creates the filter for each one of them
onReady(async () => {  //Function anonymous function that is passed to onReady
    const audios = Array.from(document.getElementsByTagName('audio')); //Getting all audio elements
    const videos = Array.from(document.getElementsByTagName('video')); //Getting all video elements
    mediaElements = [...audios, ...videos]; //Combining media elements into one array

    for (const element of mediaElements) {
        await initElement(element); //Initiates every media element.
        
        //Starts the contexts when a media source plays
        element.onplay = async () => {
            const state = elementState.get(element);
            if (!state) return; //Ignore elements that failed to initialize
            if (state.context.state === 'suspended') {
                await state.context.resume(); //Resume context on play
            }
            
            await applyMono(element); //Apply mono to the element
        };
    }
});

//Initiates an element
async function initElement(element) {
    try { //Catch any Cross-Origin Resource Sharing (CORS) errors.
        const context = new AudioContext();
        const source = context.createMediaElementSource(element);
        elementState.set(element, {context, source});
    await buildFilterChain(element); //Adds the filter chain to the current element
    } catch(error) {}
}

//Filter chain creation function
async function buildFilterChain(element) {
    const [max_frequency, min_frequency, enhancer, enhancer_gain, mono] = await Promise.all([
        browser.storage.local.get(["max_frequency"]), //Gets the float maximum frequency. Above this value, sound is cut off.
        browser.storage.local.get(["min_frequency"]), //Gets the float minimum frequency. Below this value, sound is cut off.
        browser.storage.local.get(["enhancer"]), //Gets the boolean value for whether the voice boost feature is enabled or not.
        browser.storage.local.get(["enhancer_gain"]), //Gets the float value for gain for the voice boost feature.
        browser.storage.local.get(["mono"]), //Gets the boolean value for whether the mono feature is enabled or not.
    ]);
    
    const state = elementState.get(element);
    if (!state) return; //Ignore elements that failed to initialize
    
    const {context, source} = state; //Get element context and source
    
    //Disconnects source from whatever it was previously connected to
    source.disconnect();
    
    //Creates the daisy-chained lowpass filters.  Three of them are needed to create a steeper highpass filter
    const lowpassFilters = [null, null, null];
    for (let i = 0; i < 3; i++) {
        lowpassFilters[i] = new BiquadFilterNode(context, {type: "lowpass", frequency: max_frequency["max_frequency"]});
    }

    //Creates the daisy-chained highpass filters. Three of them are needed to create a steeper highpass filter
    const highpassFilters = [null, null, null];
    for (let i = 0; i < 3; i++) {
        highpassFilters[i] = new BiquadFilterNode(context, {type: "highpass", frequency: min_frequency["min_frequency"]});
    }
    
    //Creates the peaking filter, used to boost the typical vocal range frequencies 
    const peaking = new BiquadFilterNode(context, {type: "peaking", frequency: 132.5, Q: 1, gain: enhancer_gain["enhancer_gain"]});
        
    //Enables mono output if the setting is set
    if (mono["mono"] == true) {
        context.destination.channelCount = 2; //Done to reset it (there is a strange bug when changing headphones while firefox is open)
        context.destination.channelCount = 1;   
    }

    source.connect(lowpassFilters[0]);
    lowpassFilters[0].connect(lowpassFilters[1]);
    lowpassFilters[1].connect(lowpassFilters[2]);
    lowpassFilters[2].connect(highpassFilters[0]);
    highpassFilters[0].connect(highpassFilters[1]);
    highpassFilters[1].connect(highpassFilters[2]);

    if (enhancer["enhancer"] == true) {
        highpassFilters[2].connect(peaking);
        peaking.connect(context.destination);
    } else {
        highpassFilters[2].connect(context.destination);
    }
    
    //Firefox needs an explicit resume after rebuilding the filters
    if (context.state === 'running') {
        await context.suspend();
        await context.resume();
    }
}

//Getting the reset message from the popup.js script (controls the settings). This message is fired every time a plugin setting in changed.
browser.runtime.onMessage.addListener(msgObj => {
    if (msgObj == "reset") {
        reset();
    }
});

//Applying mono audio to an element
async function applyMono(element) {
    const state = elementState.get(element);
    if (!state) return; //Ignore elements that failed to initialize
    const { mono } = await browser.storage.local.get(["mono"]);
    if (mono === true) {
        state.context.destination.channelCount = 2; //Done to reset it (there is a strange bug when changing headphones while firefox is open)
        state.context.destination.channelCount = 1;
    }
}

//Closes and recreates the audio contexts when the user changes a plugin setting from the settings popup
async function reset() {
    for (const element of mediaElements) {
        await buildFilterChain(element);
    }
}

//USEFUL LINKS:
//https://stackoverflow.com/questions/22233037/how-to-apply-basic-audio-filter-using-javascript
//https://stackoverflow.com/questions/16949768/how-can-i-reduce-the-noise-of-a-microphone-input-with-the-web-audio-api
