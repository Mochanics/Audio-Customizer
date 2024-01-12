//Copyright: Mochanics 2023

function handleInstalled(details) {
  console.log("Frequency-Limiter Plugin Installed!");
  browser.storage.local.set({"max_frequency": 20000});
  browser.storage.local.set({"min_frequency": 0});
  browser.storage.local.set({"enhancer": false});
}

browser.runtime.onInstalled.addListener(handleInstalled);