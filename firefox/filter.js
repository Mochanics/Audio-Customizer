//Copyright: Mochanics 2023

//500-10000?
//recommended min: 80 Hz
//recommended max: 15000 Hz
//Voice frequency: 85 and 180Hz
let contexes = [];

window.onload = () => {
	let audios = Array.from(document.getElementsByTagName('audio'));
	let videos = Array.from(document.getElementsByTagName('video'));

	for (let i = 0; i < audios.length; i++) {
		filter(audios[i])
	}

	for (let i = 0; i < videos.length; i++) {
		filter(videos[i])
	}
}



async function filter(instance) {
	const enabled = true;
	const voiceBoost = await browser.storage.local.get(["enhancer"]);
	const context = new AudioContext();
	contexes.push(context);

	const lowpass = context.createBiquadFilter();
	lowpass.type = "lowpass";
	const max_value = await browser.storage.local.get(["max_frequency"]);
	lowpass.frequency.value = max_value["max_frequency"];

	const highpass = context.createBiquadFilter();
	highpass.type = "highpass";
	const min_value = await browser.storage.local.get(["min_frequency"]);
	highpass.frequency.value = min_value["min_frequency"];
	
	const peaking = context.createBiquadFilter();
	peaking.type = "peaking";
	peaking.frequency.value = 132.5;
	peaking.Q.value = 1;
	peaking.gain.value = 25;

	if (enabled == true) {
		const source = context.createMediaElementSource(instance);
		const filter1 = source.connect(lowpass);
		const filter2 = filter1.connect(highpass);
		if (voiceBoost["enhancer"] == true) {
			const filter3 = filter2.connect(peaking);
			filter3.connect(context.destination);
		} else {
			filter2.connect(context.destination);
		}

	}
}

chrome.runtime.onMessage.addListener(msgObj => {
	if (msgObj == "reset") {
		reset();
	}
});

document.body.onmousemove = () => {
	for (let i = 0; i < contexes.length; i++) {
		contexes[i].resume()
	}
}

function reset() {
	for (let i = 0; i < contexes.length; i++) {
		contexes[i].close()
	}
	
	contexes = []
	
	let audios = Array.from(document.getElementsByTagName('audio'));
	let videos = Array.from(document.getElementsByTagName('video'));

	for (let i = 0; i < audios.length; i++) {
		filter(audios[i])
	}

	for (let i = 0; i < videos.length; i++) {
		filter(videos[i])
	}
}


//https://stackoverflow.com/questions/22233037/how-to-apply-basic-audio-filter-using-javascript
//https://stackoverflow.com/questions/16949768/how-can-i-reduce-the-noise-of-a-microphone-input-with-the-web-audio-api