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

function reload() {
	chrome.tabs.query({active: true, currentWindow: true}, function (arrayOfTabs) {
		chrome.tabs.reload(arrayOfTabs[0].id);
	});
}

browser.storage.local.get(["max_frequency"], (max_value) => {
	document.getElementById("max_slider").value = max_value["max_frequency"];
	document.getElementById("max_value").innerHTML = max_value["max_frequency"];
});
browser.storage.local.get(["min_frequency"], (min_value) => {
	document.getElementById("min_slider").value = min_value["min_frequency"];
	document.getElementById("min_value").innerHTML = min_value["min_frequency"];
});

document.getElementById('max_slider').onchange = max_slider;
document.getElementById('min_slider').onchange = min_slider;
document.getElementById('enhancer').onchange = enhancer;
document.getElementById('reload_button').onclick = reload;