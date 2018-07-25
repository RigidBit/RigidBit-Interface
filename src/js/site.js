"use strict";

import "../vendor/browserupdate/browserupdate.js";

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

const formFilehashInit = function()
{
	let parentSelector = "form[action='/api/filehash']";
	document.querySelector(parentSelector).addEventListener("submit", function(event)
	{
		let fileSelect = document.querySelector(parentSelector + " input[type='file']");
		let uploadButton = document.querySelector(parentSelector + " input[type='submit']");
		let uploadButtonText = uploadButton.value;

		uploadButton.value = "Uploading...";
		uploadButton.disabled = true;

		let formData = new FormData();

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

		let xhr = new XMLHttpRequest();
		xhr.open("POST", document.querySelector(parentSelector).action, true);

		xhr.onreadystatechange = function()
		{
			if(xhr.readyState === 4)
			{
				if(xhr.status === 200)
					uploadButton.value = uploadButtonText;
				else
				{
					uploadButton.value = "Upload failed!";
					alert("Operation failed: " + xhr.response);
				}

				uploadButton.disabled = false;

				console.log(xhr.response);
			}
		};

		xhr.send(formData);
	});
};







document.addEventListener("DOMContentLoaded", function()
{
	disableAllFormSubmission();
	formFilehashInit();
});



})();
