const webpack = require("webpack");

module.exports =
{
	environmentPluginGenerator: function({stage = "prod"})
	{
		let pluginOpts;

		switch(stage)
		{
			case "dev":
			{
				pluginOpts =
				{
					__DEV__: "true",
					__STAGE__: "false",
					__PROD__: "false",
				};
				break;
			}
			case "stage":
			{
				pluginOpts =
				{
					__DEV__: "false",
					__STAGE__: "true",
					__PROD__: "false",
				};
				break;
			}
			case "prod":
			{
				pluginOpts =
				{
					__DEV__: "false",
					__STAGE__: "false",
					__PROD__: "true",
				};
				break;
			}
			default:
				throw new Error(`Unknown stage ${stage}.`);
		}

		return new webpack.DefinePlugin(pluginOpts);
	},
};
