const config = require("./webpack.config.js");
const { EnvironmentPlugin } = require("webpack");
const { environmentPluginGenerator } = require("./environmentPluginGenerator.js");

// Configure dev environment.
config.plugins.push(environmentPluginGenerator({stage: "dev"}));

module.exports = config;