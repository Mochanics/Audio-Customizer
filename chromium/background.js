//Copyright: Mochanics 2024

//Runs once when the plugin is installed and sets the default stored values  for it
function handleInstalled(details) {
    console.log("Frequency-Limiter Plugin Installed!");
    chrome.storage.local.set({"max_frequency": 20000});
    chrome.storage.local.set({"min_frequency": 0});
    chrome.storage.local.set({"enhancer_gain": 10});
    chrome.storage.local.set({"enhancer": false});
    chrome.storage.local.set({"mono": false});
}

chrome.runtime.onInstalled.addListener(handleInstalled);
