const config = require("./webpack.config.js");
const {EnvironmentPlugin} = require("webpack");

// Configure dev environment.
config.plugins.push(new EnvironmentPlugin({stage: "prod"}));

module.exports = config;