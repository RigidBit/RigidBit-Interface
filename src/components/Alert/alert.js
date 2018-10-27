import tingle from "tingle.js";

export function show(content)
{
	let modal = null;

	const settings =
	{
		footer: true,
		closeMethods: ["escape"],
		cssClass: ["alert-modal"],
		onOpen: function()
		{
			$(".alert-modal button").focus();		
	    },
	    onClose: function()
	    {
	    	hide(modal);
	    },
	};

	modal = new tingle.modal(settings);

	modal.addFooterBtn("Ok", "", function()
	{
	    hide(modal);
	});

	modal.setContent(content);
	modal.open();
}

function hide(modal)
{
	$(".alert-modal").addClass("tingle-modal--hiding");

	setTimeout(function()
	{
		modal.close();

		// TODO: Reinvestigate NOT destorying the modal.
		// This is done because of a bug in Tingle.js. https://github.com/robinparisi/tingle/issues/57
		modal.destroy();
	}, 310);
}
