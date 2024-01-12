//Copyright: Mochanics 2023

function max_slider() {
	let value = Number(document.getElementById("max_slider").value);
	if (value < Number(document.getElementById("min_slider").value)) {
		document.getElementById("min_slider").value = value;
		document.getElementById("min_value").innerHTML = value.toString();
		browser.storage.local.set({"min_frequency": value});
	}
	document.getElementById("max_value").innerHTML = value.toString();
	browser.storage.local.set({"max_frequency": value});
}

function min_slider() {
	let value = Number(document.getElementById("min_slider").value);
	if (value >	Number(document.getElementById("max_slider").value)) {
		document.getElementById("max_slider").value = value;
		document.getElementById("max_value").innerHTML = value.toString();
		browser.storage.local.set({"max_frequency": value});
	}
	document.getElementById("min_value").innerHTML = value.toString();
	browser.storage.local.set({"min_frequency": value});
}

function enhancer() {
	let value = document.getElementById("enhancer").checked;
	if (value == true) {
		browser.storage.local.set({"enhancer": true});
	} else {
		browser.storage.local.set({"enhancer": false});
	}
}

browser.storage.local.get(["max_frequency"], (max_value) => {
	document.getElementById("max_slider").value = max_value["max_frequency"];
	document.getElementById("max_value").innerHTML = max_value["max_frequency"];
});

browser.storage.local.get(["min_frequency"], (min_value) => {
	document.getElementById("min_slider").value = min_value["min_frequency"];
	document.getElementById("min_value").innerHTML = min_value["min_frequency"];
});

function apply_settings() {
	chrome.tabs.query({}, tabs => {
		tabs.forEach(tab => {
		chrome.tabs.sendMessage(tab.id, "reset");
	  });
	});
}

document.getElementById('max_slider').oninput = max_slider;
document.getElementById('min_slider').oninput = min_slider;
document.getElementById('enhancer').oninput = enhancer;

document.getElementById('max_slider').onchange = apply_settings;
document.getElementById('min_slider').onchange = apply_settings;
document.getElementById('enhancer').onchange = apply_settings;