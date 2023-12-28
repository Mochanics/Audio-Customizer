//Copyright: Mochanics 2023

//500-10000?
//recommended min: 80 Hz
//recommended max: 15000 Hz
//Voice frequency: 85 and 180Hz

async function filter(instance) {
	const enabled = true;
	const voiceBoost = await browser.storage.local.get(["enhancer"]);
	console.log(voiceBoost["enhancer"]);
	const context = new AudioContext();

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
			console.log("VOICE ENHANCE ON");
			const filter3 = filter2.connect(peaking);
			filter3.connect(context.destination);
		} else {
			filter2.connect(context.destination);
		}

	}
}

document.body.onclick = () => {
Array.from(document.getElementsByTagName('audio')).forEach(audio => {
	filter(audio)
	console.log("YO")
});

Array.from(document.getElementsByTagName('video')).forEach(video => {
	filter(video)
	console.log("YO")
});
}

Array.from(document.getElementsByTagName('audio')).forEach(audio => {
	filter(audio)
	console.log("YO")
});

Array.from(document.getElementsByTagName('video')).forEach(video => {
	filter(video)
	console.log("YO")
});

//https://stackoverflow.com/questions/22233037/how-to-apply-basic-audio-filter-using-javascript
//https://stackoverflow.com/questions/16949768/how-can-i-reduce-the-noise-of-a-microphone-input-with-the-web-audio-api