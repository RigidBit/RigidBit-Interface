"use strict";

import $ from "jquery";
import log from "loglevel";

import "../vendor/browserupdate/browserupdate.js";
import * as Cookies from "../vendor/js-cookie/js-cookie.js";
import * as iziToast from "../../node_modules/izitoast/dist/js/iziToast.min.js";
require("../../node_modules/setimmediate/setImmediate.js");

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

const generateNotification = function(state, message)
{
	let title = "";
	let func = null;

	switch(state)
	{
		case("error"):
			title = "Error";
			iziToast.error({title, message});
			break;
		case("info"):
			title = "Info";
			iziToast.info({title, message});
			break;
		case("success"):
			title = "Success";
			iziToast.success({title, message});
			break;
		case("warning"):
			title = "Warning";
			iziToast.warning({title, message});
			break;
		default:
			return log.error("Invalid state provided to generateNotification().");
			break;
	}
}

const setSubmitButtonBusyState = function(submitButton, isBusy, busyText = "Saving...")
{
	let label = submitButton.querySelector("span");

	if(isBusy)
	{
		if(typeof submitButton.dataset.defaultText === "undefined")
			submitButton.dataset.defaultText = label.textContent;

		label.textContent = busyText;
		submitButton.disabled = true;
	}
	else
	{
		label.textContent = submitButton.dataset.defaultText;
		submitButton.disabled = false;
	}
};

const formDataSppendFiles = function(formData, fileSelect)
{
    let files = fileSelect.files;
    for (let i = 0; i < files.length; i++)
    {
        let name = "file" + i;
        let file = files[i];
        formData.append(name, file, file.name);
    }

	return formData;
};

const generateBaseXhr = function(method, url)
{
	const xhr = new XMLHttpRequest();

	xhr.open(method, url, true);

	xhr.setRequestHeader('cache-control', 'no-cache, must-revalidate, post-check=0, pre-check=0');
	xhr.setRequestHeader('cache-control', 'max-age=0');
	xhr.setRequestHeader('expires', '0');
	xhr.setRequestHeader('expires', 'Tue, 01 Jan 1980 1:00:00 GMT');
	xhr.setRequestHeader('pragma', 'no-cache');

	return xhr;
};

const formGenerateXhr = function(method, url, submitButton=null)
{
	const xhr = generateBaseXhr(method, url);

	xhr.onreadystatechange = function()
	{
		if(xhr.readyState === 4)
		{
			if(submitButton)
				setSubmitButtonBusyState(submitButton, false);

			if(xhr.status === 200)
			{
				let message = JSON.parse(xhr.response).message;
				generateNotification("success", message);
				statusUpdate();
			}
			else
			{
				if(submitButton)
					submitButton.querySelector("span").innerText = "Save failed!";
				generateNotification("error", "Operation failed: " + xhr.response);
			}

			log.debug(JSON.stringify(JSON.parse(xhr.response), null, 4));
		}
	};

	return xhr;
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

const formFileLabelInit = function()
{
	const parentSelector = "form label.file";
	Array.from(document.querySelectorAll(parentSelector)).forEach(function(parent)
	{
		const filename = parent.querySelector("span.filename");
		const file = parent.querySelector("input[type='file']");

		file.addEventListener("change", function(event)
		{
			filename.innerText = file.value.replace(/.*[\/\\]/, '');
		});

	});
};

const formFileInit = function()
{
	const parentSelector = "form[action='/api/file']";
	document.querySelector(parentSelector).addEventListener("submit", function(event)
	{
		let fileSelect = document.querySelector(parentSelector + " input[type='file']");
		let submitButton = document.querySelector(parentSelector + " button[class='submit']");

		setSubmitButtonBusyState(submitButton, true);

		// Collect form data.
		const formData = new FormData();
		formDataSppendFiles(formData, fileSelect);

		const xhr = formGenerateXhr("POST", formUrlFromActionUrl(document.querySelector(parentSelector).action), submitButton);
		xhr.send(formData);
	});
};

const formFilehashInit = function()
{
	const parentSelector = "form[action='/api/filehash']";
	document.querySelector(parentSelector).addEventListener("submit", function(event)
	{
		let fileSelect = document.querySelector(parentSelector + " input[type='file']");
		let submitButton = document.querySelector(parentSelector + " button[class='submit']");

		setSubmitButtonBusyState(submitButton, true);

		// Collect form data.
		const formData = new FormData();
		formDataSppendFiles(formData, fileSelect);

		const xhr = formGenerateXhr("POST", formUrlFromActionUrl(document.querySelector(parentSelector).action), submitButton);
		xhr.send(formData);
	});
};

const formTextInit = function()
{
	const parentSelector = "form[action='/api/text']";
	document.querySelector(parentSelector).addEventListener("submit", function(event)
	{
		let submitButton = document.querySelector(parentSelector + " button[class='submit']");
		let textField = document.querySelector(parentSelector + " textarea[name='text']");

		setSubmitButtonBusyState(submitButton, true);

		// Collect form data.
		const formData = new FormData();
		formData.append("text", textField.value);

		const xhr = formGenerateXhr("POST", formUrlFromActionUrl(document.querySelector(parentSelector).action), submitButton);
		xhr.send(formData);
	});

	const textarea = document.querySelector(parentSelector + " div.textarea textarea[name='text']");
	const counter = document.querySelector(parentSelector + " div.textarea span.counter");
	const textAreaChange = function()
	{
		counter.innerText = textarea.maxLength - textarea.value.length;
		
	};
	textarea.addEventListener("change", textAreaChange);
	textarea.addEventListener("keydown", textAreaChange);
	textarea.addEventListener("keyup", textAreaChange);
	textarea.addEventListener("paste", function(){setImmediate(textAreaChange);});
	textAreaChange();
};

const formTimestampInit = function()
{
	const parentSelector = "form[action='/api/timestamp']";
	document.querySelector(parentSelector).addEventListener("submit", function(event)
	{
		let submitButton = document.querySelector(parentSelector + " button[class='submit']");

		setSubmitButtonBusyState(submitButton, true);

		const xhr = formGenerateXhr("POST", formUrlFromActionUrl(document.querySelector(parentSelector).action), submitButton);
		xhr.send(new FormData());
	});
};

const populateGenesisHash = function()
{
	const $genesisHash = $("form[action='/api/status'] .genesis_hash");
	let text = $genesisHash.data("genesis_hash");

	if($genesisHash.hasClass("hidden"))
		text = text.replace(/\w/g, "•");

	$genesisHash.text(text);
};

const showHideGenesisInit = function()
{
	$("a[href='#showHideGenesis']").on("click", function(e)
	{
		e.preventDefault();

		const $genesisHash = $("form[action='/api/status'] .genesis_hash");
		$genesisHash.toggleClass("hidden");
		populateGenesisHash();
	});
};

const statusUpdate = function()
{
	const parentSelector = "form[action='/api/status']";
	const xhr = generateBaseXhr("GET", formUrlFromActionUrl(document.querySelector(parentSelector).action));

	xhr.onreadystatechange = function()
	{
		if(xhr.readyState === 4)
		{
			if(xhr.status === 200)
			{
				const response = JSON.parse(xhr.response);
				const values = ["block_height", "genesis_hash", "last_hash", "last_type", "last_timestamp", "rigidbit_version"];

				// Update format for timestamp.
				const date = new Date(parseInt(response["last_timestamp"]) * 1000);
				response["last_timestamp"] = date.toISOString();

				values.forEach(function(value)
				{
					if(value === "genesis_hash")
					{
						$(parentSelector + " ." + value).data("genesis_hash", response[value]);
						populateGenesisHash();
					}
					else
						document.querySelector(parentSelector + " ." + value).innerText = response[value];
				});
			}
			else
			{
				generateNotification("error", "Operation failed: " + xhr.response);
			}

			log.debug(JSON.stringify(JSON.parse(xhr.response), null, 4));
		}
	};

	xhr.send(new FormData());
};

const statusInit = function()
{
	setInterval(statusUpdate, 5 * 1000);
	statusUpdate();
};

const statusRefreshInit = function()
{
	const parentSelector = "section.status a.refresh";
	const refreshButton = document.querySelector(parentSelector);

	refreshButton.addEventListener("click", function(event)
	{
		event.preventDefault();
		statusUpdate();
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

	// Configure iziToast.
	iziToast.settings(
	{
		position: "topRight",
	});

	disableAllFormSubmission();
	formFileLabelInit();
	formFileInit();
	formFilehashInit();
	formTextInit();
	formTimestampInit();
	showHideGenesisInit();
	statusInit();
	statusRefreshInit();
});

})();
