import tingle from "tingle.js";

let modal = null;

export function show(content, onConfirm=null, passedSettings={})
{
	const defaultSettings =
	{
		cancelLabel: "Cancel",
		confirmLabel: "Confirm",
		footer: true,
		closeMethods: ["escape"],
		cssClass: ["confirm-modal"],
		onOpen: function()
		{
			$(".confirm-modal button.cancel-button").focus();		
	    },
	    onClose: function()
	    {
	    	hide();
	    },
	};
	const settings = Object.assign({}, defaultSettings, passedSettings);

	if(!modal)
		modal = new tingle.modal(settings);

	modal.setContent(content);
	modal.addFooterBtn(settings.cancelLabel, "cancel-button", function()
	{
	    hide();
	});
	modal.addFooterBtn(settings.confirmLabel, "confirm-button", function()
	{
	    hide();

	    if(onConfirm)
	    	onConfirm();
	});
	modal.open();
}

export function hide()
{
	const _modal = modal;
	modal = null;

	if(_modal)
	{
		$(".confirm-modal").addClass("tingle-modal--hiding");

		setTimeout(function()
		{
			_modal.close();

			// TODO: Reinvestigate NOT destorying the modal.
			// This is done because of a bug in Tingle.js. https://github.com/robinparisi/tingle/issues/57
			_modal.destroy();
		}, 310);
	}
}
