//Copyright: Mochanics 2023

//Gets the value from the max frequency slider and passes it to the stored value
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

//Gets the value from the min frequency slider and passes it to the stored value
function min_slider() {
    let value = Number(document.getElementById("min_slider").value);
    if (value > Number(document.getElementById("max_slider").value)) {
        document.getElementById("max_slider").value = value;
        document.getElementById("max_value").innerHTML = value.toString();
        browser.storage.local.set({"max_frequency": value});
    }
    document.getElementById("min_value").innerHTML = value.toString();
    browser.storage.local.set({"min_frequency": value});
}

//Gets the value from the from the enhancer checkmark/toggle button and passes it to the stored value
function enhancer() {
    let value = document.getElementById("enhancer").checked;
    if (value == true) {
        browser.storage.local.set({"enhancer": true});
    } else {
        browser.storage.local.set({"enhancer": false});
    }
}

//Gets the value from the from the enhancer checkmark/toggle button and passes it to the stored value
function mono() {
    let value = document.getElementById("mono").checked;
    if (value == true) {
        browser.storage.local.set({"mono": true});
    } else {
        browser.storage.local.set({"mono": false});
    }
}

//Gets the value for the  max frequency from storage and passes it to the slider
browser.storage.local.get(["max_frequency"], (max_value) => {
    document.getElementById("max_slider").value = max_value["max_frequency"];
    document.getElementById("max_value").innerHTML = max_value["max_frequency"];
});

//Gets the value for the  min frequency from storage and passes it to the slider
browser.storage.local.get(["min_frequency"], (min_value) => {
    document.getElementById("min_slider").value = min_value["min_frequency"];
    document.getElementById("min_value").innerHTML = min_value["min_frequency"];
});

browser.storage.local.get(["enhancer"], (enhancer) => {
    document.getElementById("enhancer").checked = enhancer["enhancer"];
});

browser.storage.local.get(["mono"], (mono) => {
    document.getElementById("mono").checked = mono["mono"];
});

//Sends the "reset" message to all the browser tabs when the settings are changed to restart the filter.js files running on them
function apply_settings() {
    chrome.tabs.query({}, tabs => {
        tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, "reset");
      });
    });
}

//Runs the update functions when the settings buttons/sliders are updated
document.getElementById('max_slider').oninput = max_slider;
document.getElementById('min_slider').oninput = min_slider;
document.getElementById('enhancer').oninput = enhancer;
document.getElementById('mono').oninput = mono;

//Runs the applies the settings when the settings buttons/sliders are changed
document.getElementById('max_slider').onchange = apply_settings;
document.getElementById('min_slider').onchange = apply_settings;
document.getElementById('enhancer').onchange = apply_settings;
document.getElementById('mono').onchange = apply_settings;