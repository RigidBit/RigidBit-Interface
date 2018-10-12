const ExtractTextPlugin = require("extract-text-webpack-plugin");
const globImporter = require("node-sass-glob-importer");
const HtmlWebpackInlineSourcePlugin = require("html-webpack-inline-source-plugin");
const IgnoreEmitPlugin = require("ignore-emit-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { minify } = require("html-minifier");
const path = require("path");
const webpack = require("webpack");

module.exports = function(stage = "prod")
{
	console.log("STAGE:", stage);

	const exports =
	{
		entry:
		{
			"site.js": "./src/site.jsx",
			"site.css": "./src/site.scss",
		},
		mode: (stage === "prod") ? "production" : "development",
		module:
		{
			rules:
			[
				// { test: /\.(jpg|png)$/, use: [ "file-loader" ] },
				{
					test: /\.(js|jsx)$/,
					loader: "babel-loader",
					exclude: /node_modules/,
					query:
					{
						compact: false,
						presets: ["es2015", "react", "mobx"]
					}
				},
				{
					test: /\.(scss|css)$/, use: ExtractTextPlugin.extract(
					{
						fallback: "style-loader",
						use: ["css-loader", { loader: "sass-loader", options: { importer: globImporter() } }],
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
			maxEntrypointSize: 1024 * 1024 * 3,
			maxAssetSize: 1024 * 1024 * 3,
		},
		stats:
		{
			colors: true,
		},
		plugins:
		[
			new webpack.ProvidePlugin(
			{
				$: "jquery",
				_: "lodash",
				jQuery: "jquery",
				log: "loglevel",
				parseBool: "parseboolean",
				React: "react",
				ReactDom: "react-dom",

				action: ["mobx", "action"],
				mobx: ["mobx"],
				observable: ["mobx", "observable"],
				observer: ["mobx-react", "observer"],

				api: path.resolve(__dirname, "../../src/common/js/api.js"),
				config: [path.resolve(__dirname, "../../src/common/js/config.js"), "default"],
				router: [path.resolve(__dirname, "../../src/common/js/router.js"), "router"],
				store: [path.resolve(__dirname, "../../src/common/js/store.js"), "default"],
			}),
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
