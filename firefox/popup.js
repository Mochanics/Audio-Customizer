//Copyright: Mochanics 2024

//Function to resert the settings to their default values
function reset() {
    const default_values = {"max_frequency": 20000, "min_frequency": 0, "enhancer_gain": 10 ,"enhancer": false, "mono":  false};
    
    document.getElementById("max_slider").value = default_values["max_frequency"];
    document.getElementById("max_value").innerHTML = default_values["max_frequency"];
    browser.storage.local.set({"max_frequency": default_values["max_frequency"]});
    
    document.getElementById("min_slider").value = default_values["min_frequency"];
    document.getElementById("min_value").innerHTML = default_values["min_frequency"];
    browser.storage.local.set({"min_frequency": default_values["min_frequency"]});
    
    document.getElementById("enhancer_slider").value = default_values["enhancer_gain"];
    document.getElementById("enhancer_value").innerHTML = default_values["enhancer_gain"];
    browser.storage.local.set({"enhancer_gain": default_values["enhancer_gain"]});
    
    document.getElementById("enhancer").checked = default_values["enhancer"];
    document.getElementById("enhancer_slider").disabled = !default_values["enhancer"];
    browser.storage.local.set({"enhancer": default_values["enhancer"]});
    
    document.getElementById("mono").checked = default_values["mono"];
    browser.storage.local.set({"mono": default_values["mono"]});
    
    apply_settings();
}

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

//Gets the value from the voice boost enhancer slider and passes it to the stored value
function enhancer_slider() {
    let value = Number(document.getElementById("enhancer_slider").value);
    console.log(value);

    document.getElementById("enhancer_value").innerHTML = value.toString();
    browser.storage.local.set({"enhancer_gain": value});
}

//Gets the value from the from the enhancer checkmark/toggle button and passes it to the stored value
function enhancer() {
    let value = document.getElementById("enhancer").checked;
    if (value == true) {
        browser.storage.local.set({"enhancer": true});
        document.getElementById("enhancer_slider").disabled = false;
    } else {
        browser.storage.local.set({"enhancer": false});
        document.getElementById("enhancer_slider").disabled = true;
    }
}

//Gets the value from the from the mono checkmark/toggle button and passes it to the stored value
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

//Gets the value for the  enhancer gain from storage and passes it to the slider
browser.storage.local.get(["enhancer_gain"], (enhancer_gain) => {
    document.getElementById("enhancer_slider").value = enhancer_gain["enhancer_gain"];
    document.getElementById("enhancer_value").innerHTML = enhancer_gain["enhancer_gain"];
});

//Gets the value for the  enhancer from storage and passes it to the checkmark/toggle button
browser.storage.local.get(["enhancer"], (enhancer) => {
    document.getElementById("enhancer").checked = enhancer["enhancer"];
    document.getElementById("enhancer_slider").disabled = !enhancer["enhancer"]; //Needs to be inverted as the slider disabled value is opposite that of the enhancer enabled value.
});

//Gets the value for mono from storage and passes it to the checkmark/toggle button
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
document.getElementById('enhancer_slider').oninput = enhancer_slider;
document.getElementById('enhancer').oninput = enhancer;
document.getElementById('mono').oninput = mono;
document.getElementById('reset').onclick = reset;

//Runs the applies the settings when the settings buttons/sliders are changed
document.getElementById('max_slider').onchange = apply_settings;
document.getElementById('min_slider').onchange = apply_settings;
document.getElementById('enhancer_slider').onchange = apply_settings;
document.getElementById('enhancer').onchange = apply_settings;
document.getElementById('mono').onchange = apply_settings;