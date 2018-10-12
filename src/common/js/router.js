import {createRouter} from "router5";
import loggerPlugin from "router5/plugins/logger"; 
import browserPlugin from "router5/plugins/browser";

import store from "./store.js";

export const routes =
[
	{ name: "block", path: "/block/:id" },
	{ name: "blocks", path: "/blocks/:count/:offset" },
	{ name: "dashboard", path: "/dashboard" },
	{ name: "file", path: "/file" },
	{ name: "filehash", path: "/filehash" },
	{ name: "timestamp", path: "/timestamp" },
	{ name: "message", path: "/message" }
];

let storeUpdatePlugin = function(router, dependencies)
{
	const pluginObj =
	{
		onTransitionSuccess: (toState, fromState) =>
		{
			action(()=>
			{
				store.route = toState.name;
				store.routeParams = toState.params;
			})();
		},
	};
	return pluginObj;
};
storeUpdatePlugin.pluginName = "STORE_UPDATE_PLUGIN";

export const router = createRouter(routes, {defaultRoute: "dashboard"});

router.usePlugin(storeUpdatePlugin);
router.usePlugin(browserPlugin({useHash: true}));
if(__DEV__) router.usePlugin(loggerPlugin);

router.start();
