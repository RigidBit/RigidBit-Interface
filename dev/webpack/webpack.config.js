const ExtractTextPlugin = require("extract-text-webpack-plugin");
const HtmlWebpackInlineSourcePlugin = require("html-webpack-inline-source-plugin");
const IgnoreEmitPlugin = require("ignore-emit-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { minify } = require("html-minifier");
const path = require("path");

module.exports =
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
				collapseWhitespace: true,
				minifyCSS: true,
				minifyJS: true,
				removeComments: true,
			},
		}),
		new HtmlWebpackInlineSourcePlugin(),
		new IgnoreEmitPlugin(/\.(css|js|scss)$/),
	],
};
