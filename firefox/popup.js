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

//This normalization function needs to exist because themes can return SIX different color formats: #000, #00000, [r, g, b],  [r, g, b, a], "rgb(r,g,b)", "rgba(r,g,b,a)"
function toRGBA(color) {
    //If in array format: [r, g, b] or [r, g, b, a]
    if (Array.isArray(color)) {
        const [r, g, b, a = 1] = color;
        return [r, g, b, a];
    }

    //If in hex format: #000 or #000000
    if (typeof color === 'string' && color.startsWith('#')) {
        const hex = color.slice(1);
        const full = hex.length === 3
            ? hex.split('').map(c => c + c).join('') //Expand shorthand
            : hex;
        return [
            parseInt(full.slice(0, 2), 16),
            parseInt(full.slice(2, 4), 16),
            parseInt(full.slice(4, 6), 16),
            1
        ];
    }

    //If in rgb or rgba string format: "rgb(r,g,b)", "rgba(r,g,b,a)"
    if (typeof color === 'string') {
        const [r, g, b, a = 1] = color.match(/[\d.]+/g).map(Number);
        return [r, g, b, a];
    }

    return null;
}

//Calculates luminance and finds if the color is light or dark (dark is true if less than the tipping point)
function isColorDark(color) {
    const rgba = toRGBA(color); //Color normalization
    const [r, g, b] = rgba //Converts rgba array to actual rgb values

    //Uses the luminance formula from https://www.w3.org/WAI/GL/wiki/Relative_luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    const tippingPoint = 0.5; //Current tipping point

    return luminance < tippingPoint;
}

//Checks if a color is opaque (transparency is above 0.5)
function isOpaque(color) {
    const rgba = toRGBA(color); //Color normalization
    return rgba !== null && rgba[3] > 0.5; //Checks alpha
}

//Detects if a theme is dark or light
function detectDark(theme) {
    const colors = theme.colors;

    //First checks if any any opaque background colors are dark to infer if custom theme is light or dark. 
    const bgDark = [colors?.toolbar, colors?.frame, colors?.popup, colors?.ntp_background].filter(isOpaque).map(color => isColorDark(color));

    //Then, check if any text colors are dark to infer if custom theme is light or dark. Useful if previous color elements are transparent.
    const textDark = [colors?.toolbar_text, colors?.bookmark_text, colors?.tab_background_text].filter(isOpaque).map(color => !isColorDark(color));

    const all = [...bgDark, ...textDark]; //Combining both text and background color signals into one array

    if (all.length === 0) return window.matchMedia('(prefers-color-scheme: dark)').matches; //If no custom theme is used, falls back to OS preference
    
    //Get total number of valid darkness signals
    const darkCount = all.filter(Boolean).length;
    
    //Get number of darkness signals that are "true"
    const confidence = darkCount / all.length; 

    //Only trusting decisive results
    if (confidence > 0.75) return true;
    if (confidence < 0.25) return false;

    //If ambiguous, falls back to OS preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

//Runs the theme darkness detection function when popup is open to set the correct css style sheet.
window.onload = async () => {
    const theme = await browser.theme.getCurrent();

    const isDark = detectDark(theme);
    
    if (isDark) {
        document.getElementById("style").setAttribute("href", "dark.css");
    } else {
        document.getElementById("style").setAttribute("href", "light.css");
    }
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
