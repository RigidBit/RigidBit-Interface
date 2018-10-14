import {createRouter} from "router5";
import browserPlugin from "router5/plugins/browser";

import store from "./store.js";

export const routes =
[
	{ name: "block", path: "/block/:id" },
	{ name: "blocks", path: "/blocks/:count/:offset" },
	{ name: "dashboard", path: "/dashboard" },
	{ name: "file", path: "/file" },
	{ name: "upload", path: "/upload" },
];

const storeUpdatePlugin = function(router, dependencies)
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

// We are rewriting the logger plugin to not use grouped console logging.
const loggerPlugin = function()
{
    console.info("Router started.");

    const obj =
	{
        onStop()
        {
            console.info("Router stopped.");
        },
        onTransitionStart(toState, fromState)
        {
            console.log("Transition started from state:");
            console.log(fromState);
            console.log("To state:");
            console.log(toState);
        },
        onTransitionCancel()
        {
            console.warn("Transition cancelled.");
        },
        onTransitionError(toState, fromState, err)
        {
            console.warn("Transition error with code: " + err.code);
        },
        onTransitionSuccess()
        {
            console.log("Transition success.");
        }
    };

    return obj;
};
loggerPlugin.pluginName = "LOGGER_PLUGIN";

export const router = createRouter(routes, {defaultRoute: "dashboard"});

router.usePlugin(storeUpdatePlugin);
router.usePlugin(browserPlugin({useHash: true}));
if(__DEV__) router.usePlugin(loggerPlugin);

router.start();
