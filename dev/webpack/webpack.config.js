const ExtractTextPlugin = require("extract-text-webpack-plugin");
const HtmlWebpackInlineSourcePlugin = require("html-webpack-inline-source-plugin");
const IgnoreEmitPlugin = require("ignore-emit-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { minify } = require("html-minifier");
const path = require("path");

module.exports = function(stage = "prod")
{
	const exports =
	{
		entry:
		{
			"site.js": "./src/js/site.js",
			"site.css": "./src/scss/site.scss",
		},
		mode: "production",
		module:
		{
			rules:
			[
				// { test: /\.(jpg|png)$/, use: [ "file-loader" ] },
				{
					test: /\.(scss|css)$/, use: ExtractTextPlugin.extract(
					{
						fallback: "style-loader",
						use: ["css-loader", "sass-loader"],
					}),
				},
			],
		},
		output:
		{
			filename: "[name]",
			path: path.resolve(__dirname, "../../dist"),
		},
		performance:
		{
			hints: "warning",
			maxEntrypointSize: 1024 * 1024 * 1,
			maxAssetSize: 1024 * 1024 * 1,
		},
		plugins:
		[
			new ExtractTextPlugin("site.css"),
			new HtmlWebpackPlugin(
			{
				filename: "index.html",
				template: "src/index.html",
				inlineSource: ".(js|css)$",
				minify:
				{
					collapseWhitespace: (stage === "prod"),
					minifyCSS: (stage === "prod"),
					minifyJS: (stage === "prod"),
					removeComments: (stage === "prod"),
				},
			}),
			new HtmlWebpackInlineSourcePlugin(),
			new IgnoreEmitPlugin(/\.(css|js|scss)$/),
		],
	};

	return exports;
};
