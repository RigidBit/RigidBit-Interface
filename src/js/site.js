"use strict";

import "../vendor/browserupdate/browserupdate.js";
import * as Cookies from "../vendor/js-cookie/js-cookie.js";
import log from "loglevel";

(function(){

const disableAllFormSubmission = function()
{
	Array.from(document.getElementsByTagName("form")).forEach(function(form)
	{
		form.addEventListener("submit", function(event)
		{
			event.preventDefault();
		});
	});
};

const setSubmitButtonBusyState = function(uploadButton, isBusy)
{
	console.log(uploadButton.dataset.defaultText);
	if(isBusy)
	{
		if(typeof uploadButton.dataset.defaultText === "undefined")
			uploadButton.dataset.defaultText = uploadButton.value;

		uploadButton.value = "Uploading...";
		uploadButton.disabled = true;
	}
	else
	{
		uploadButton.value = uploadButton.dataset.defaultText;
		uploadButton.disabled = false;
	}
};

const formUrlFromActionUrl = function(actionUrl)
{
	const baseUrl = (__DEV__ && Cookies.get("baseUrl")) ? Cookies.get("baseUrl") : false;
	let formUrl = actionUrl;

	if(baseUrl !== false)
	{
		formUrl = formUrl.replace(window.location.origin, "");
		formUrl = baseUrl + formUrl;
		log.debug("formUrl:", formUrl);
	}

	return formUrl;
};

const formFilehashInit = function()
{
	let parentSelector = "form[action='/api/filehash']";
	document.querySelector(parentSelector).addEventListener("submit", function(event)
	{
		let fileSelect = document.querySelector(parentSelector + " input[type='file']");
		let uploadButton = document.querySelector(parentSelector + " input[type='submit']");

		setSubmitButtonBusyState(uploadButton, true);

		const formData = new FormData();

		// Add files.
		let files = fileSelect.files;
		for (let i = 0; i < files.length; i++)
		{
			let name = "file" + i;
			let file = files[i];
			formData.append(name, file, file.name);
		}

		// Add additional form fields.
		// formData.append("test", fieldTest.value);

		const formUrl = formUrlFromActionUrl(document.querySelector(parentSelector).action);

		const xhr = new XMLHttpRequest();
		xhr.open("POST", formUrl, true);

		xhr.onreadystatechange = function()
		{
			if(xhr.readyState === 4)
			{
				setSubmitButtonBusyState(uploadButton, false);

				if(xhr.status !== 200)
				{
					uploadButton.value = "Upload failed!";
					alert("Operation failed: " + xhr.response);
				}

				log.debug(xhr.response);
			}
		};

		xhr.send(formData);
	});
};

const formTimestampInit = function()
{
	let parentSelector = "form[action='/api/timestamp']";
	document.querySelector(parentSelector).addEventListener("submit", function(event)
	{
		let uploadButton = document.querySelector(parentSelector + " input[type='submit']");

		setSubmitButtonBusyState(uploadButton, true);

		const formData = new FormData();

		const formUrl = formUrlFromActionUrl(document.querySelector(parentSelector).action);

		const xhr = new XMLHttpRequest();
		xhr.open("POST", formUrl, true);

		xhr.onreadystatechange = function()
		{
			if(xhr.readyState === 4)
			{
				setSubmitButtonBusyState(uploadButton, false);

				if(xhr.status !== 200)
				{
					uploadButton.value = "Save failed!";
					alert("Operation failed: " + xhr.response);
				}

				log.debug(xhr.response);
			}
		};

		xhr.send(formData);
	});
};

document.addEventListener("DOMContentLoaded", function()
{
	// Make Cookies available for use in dev environments to set the baseUrl.
	if(__DEV__)
	{
		window.Cookies = Cookies;
		console.log("baseUrl: ", Cookies.get("baseUrl"));
	}

	// Configure logging.
	if(__DEV__)
		log.setLevel(log.levels.DEBUG);
	else
		log.setLevel(log.levels.ERROR);

	disableAllFormSubmission();
	formFilehashInit();
	formTimestampInit();
});

})();
