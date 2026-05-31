const router = require("express").Router();
const { readdirSync } = require('fs-extra');
const path = require('path');
const log = require('./log');
const { performance } = require('perf_hooks');
const compression = require('compression');
const srcPath = path.join(__dirname, "../api/");

// Use compression middleware
router.use(compression());

// Cache API modules
const apiCache = new Map();

// Preload API modules
const apiFiles = readdirSync(srcPath).filter(file => file.endsWith(".js"));
apiFiles.forEach(file => {
  const filePath = path.join(srcPath, file);
  const api = require(filePath);

  // Check for legacy keys (meta, onStart) and assign them to the expected keys (config, initialize)
  if (!api.config && api.meta) {
    api.config = api.meta;
  }
  if (!api.initialize && api.onStart) {
    api.initialize = api.onStart;
  }

  if (api.config && api.initialize) {
    apiCache.set(api.config.name, api);
  } else {
    log.main(`Skipping API module in file ${file} because it is missing the required keys.`);
  }
});

// Set up routes
let n = 0;
apiCache.forEach((api, name) => {
  const routePath = `/api/${name}`;
  router.get(routePath, async (req, res) => {
    try {
      await api.initialize({ req, res, log });
    } catch (error) {
      console.error(`Error in ${name} API:`, error);
      res.status(500).send("An error occurred");
    }
  });
  if (global.api && global.api instanceof Map) {
    global.api.set(name, api);
  } else {
    console.warn("global.api is not a Map. Skipping setting API in global scope.");
  }
  n++;
  log.main(`Successfully loaded ${name}`);
});

log.main(`Successfully loaded ${n} API${n !== 1 ? 's' : ''}`);

module.exports = router;

