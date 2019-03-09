const config = require("./webpack.config.js")("dev");
const { EnvironmentPlugin } = require("webpack");
const { environmentPluginGenerator } = require("./environmentPluginGenerator.js");

// Configure dev environment.
config.plugins.push(environmentPluginGenerator({stage: "dev"}));

// Increase the warning size of assets in development since it is uncompressed. 
config.performance.maxAssetSize = 1024 * 1024 * 10;

module.exports = config;