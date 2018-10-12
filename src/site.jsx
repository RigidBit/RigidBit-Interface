"use strict";

import "./vendor/browserupdate/browserupdate.js";
import * as Cookies from "./vendor/js-cookie/js-cookie.js";
import * as iziToast from "izitoast";
require("../node_modules/setimmediate/setImmediate.js");
import {configure as mobxConfigure, autorun} from "mobx";

import App from "./containers/App/App.jsx";

document.addEventListener("DOMContentLoaded", function()
{
	// Make Cookies available for use in dev environments to set the baseUrl.
	if(__DEV__)
	{
		window.Cookies = Cookies;
		console.log("baseUrl: ", Cookies.get("baseUrl"));
	}

	// Make jQuery available through $ in dev environments.
	if(__DEV__)
		window.$ = $;

	// Configure logging.
	if(__DEV__)
		log.setLevel(log.levels.DEBUG);
	else
		log.setLevel(log.levels.ERROR);

	// Configure iziToast.
	iziToast.settings(
	{
		position: "topRight",
	});

	// Configure MobX.
	mobxConfigure({enforceActions: "observed"});

	// Init store.
	if(__DEV__)
		log.debug("STORE:", store);

	// Init Router5.
	if(__DEV__)
		log.debug("ROUTER:", router);

	// Initialize React.
	ReactDom.render(<App />, document.getElementById("root"));
});
