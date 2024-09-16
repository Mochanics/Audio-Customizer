//Copyright: Mochanics 2024

//Runs once when the plugin is installed and sets the default stored values  for it
function handleInstalled(details) {
    console.log("Frequency-Limiter Plugin Installed!");
    browser.storage.local.set({"max_frequency": 20000});
    browser.storage.local.set({"min_frequency": 0});
    browser.storage.local.set({"enhancer_gain": 10});
    browser.storage.local.set({"enhancer": false});
    browser.storage.local.set({"mono": false});
}

browser.runtime.onInstalled.addListener(handleInstalled);