const config = require("./webpack.config.js")("prod");
const { EnvironmentPlugin } = require("webpack");
const { environmentPluginGenerator } = require("./environmentPluginGenerator.js");

// Configure dev environment.
config.plugins.push(environmentPluginGenerator({stage: "prod"}));

module.exports = config;