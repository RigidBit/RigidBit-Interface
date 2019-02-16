import * as confirm from "../../components/Confirm/confirm.js";
import tingle from "tingle.js";

export function	openAddTagModal(onConfirm=null)
{
	let modal = null;

	const hide = () =>
	{
		const _modal = modal;
		modal = null;

		if(_modal)
		{
			$(".add-tag-modal").addClass("tingle-modal--hiding");

			setTimeout(function()
			{
				_modal.close();

				// TODO: Reinvestigate NOT destorying the modal.
				// This is done because of a bug in Tingle.js. https://github.com/robinparisi/tingle/issues/57
				_modal.destroy();
			}, 310);
		}
	};

	const settings =
	{
		cancelLabel: "Cancel",
		confirmLabel: "Add",
		footer: true,
		closeMethods: ["escape"],
		cssClass: ["add-tag-modal"],
		onOpen: function()
		{
	    },
	    onClose: function()
	    {
	    	hide();
	    },
	};

	const $html = renderAddTagForm();

	if(!modal)
		modal = new tingle.modal(settings);

	modal.setContent($html[0]);
	modal.addFooterBtn(settings.cancelLabel, "cancel-button", function()
	{
	    hide();
	});
	modal.addFooterBtn(settings.confirmLabel, "confirm-button", function()
	{
	    hide();

	    if(onConfirm)
	    {
	    	const $form = $('div.add-tag-container > form');
	    	const data = $form.serializeObject();
	    	onConfirm(data);
	    }
	});
	modal.open();

	initAddTagForm();
}


export function	openEditTagModal(data, onConfirm=null)
{
	let modal = null;

	const hide = () =>
	{
		const _modal = modal;
		modal = null;

		if(_modal)
		{
			$(".edit-tag-modal").addClass("tingle-modal--hiding");

			setTimeout(function()
			{
				_modal.close();

				// TODO: Reinvestigate NOT destorying the modal.
				// This is done because of a bug in Tingle.js. https://github.com/robinparisi/tingle/issues/57
				_modal.destroy();
			}, 310);
		}
	};

	const settings =
	{
		cancelLabel: "Cancel",
		confirmLabel: "Save",
		footer: true,
		closeMethods: ["escape"],
		cssClass: ["edit-tag-modal"],
		onOpen: function()
		{
	    },
	    onClose: function()
	    {
	    	hide();
	    },
	};

	const $html = renderEditTagForm(data);

	if(!modal)
		modal = new tingle.modal(settings);

	modal.setContent($html[0]);
	modal.addFooterBtn(settings.cancelLabel, "cancel-button", function()
	{
	    hide();
	});
	modal.addFooterBtn(settings.confirmLabel, "confirm-button", function()
	{
	    hide();

	    if(onConfirm)
	    {
	    	const $form = $('div.edit-tag-container > form');
	    	const data = $form.serializeObject();
	    	onConfirm(data);
	    }
	});
	modal.open();

	initEditTagForm();
}

export function openDeleteTagModal(data, onConfirm)
{
	confirm.show(`Are you sure you want to delete tag #${data.id} "${data.name}"?`, ()=>{onConfirm(data)});
}

function initAddTagForm()
{
	const $button = $(".add-tag-container button.random-color");
	const $color = $(".add-tag-container input[name='color']");
	const $colorPicker = $(".add-tag-container .color-preview > input");
	const $colorPreview = $(".add-tag-container .color-preview");
	const $name = $(".add-tag-container input.name");

	$button.on("click", function(e)
	{
		$color.val((Math.random()*0xffffff).toString(16).slice(-6));
		updateAddTagState();
	});

	$color.on("change keyup", function(e)
	{
		updateAddTagState();
	});

	$colorPicker.on("change", function(e)
	{
		$color.val($colorPicker.val().replace("#", ""));
		updateAddTagState();
	});

	$name.on("change keyup", function(e)
	{
		updateAddTagState();
	});

	$name.on("keypress", function(e)
	{
		if(e.keyCode === 32)
			return false;
	});

	$button.click();
}

function initEditTagForm()
{
	const $button = $(".edit-tag-container button.random-color");
	const $color = $(".edit-tag-container input[name='color']");
	const $colorPicker = $(".edit-tag-container .color-preview > input");
	const $colorPreview = $(".edit-tag-container .color-preview");
	const $name = $(".edit-tag-container input.name");

	$button.on("click", function(e)
	{
		$color.val((Math.random()*0xffffff).toString(16).slice(-6));
		updateEditTagState();
	});

	$color.on("change keyup", function(e)
	{
		updateEditTagState();
	});

	$colorPicker.on("change", function(e)
	{
		$color.val($colorPicker.val().replace("#", ""));
		updateEditTagState();
	});

	$name.on("change keyup", function(e)
	{
		updateEditTagState();
	});

	$name.on("keypress", function(e)
	{
		if(e.keyCode === 32)
			return false;
	});

	updateEditTagState();
}

function renderAddTagForm()
{
	const $container = $('<div class="add-tag-container" />');
	const $h1 = $("<h1>Add Tag</h1>");
	const $form = $('<form onSubmit="return false;" />');
	const $name = $('<label class="name">Name<input type="text" class="name" name="name" value="" placeholder="Documents" minLength=1 maxLength=64 required /></label>');
	const color =
	`
		<label class="color">
			Color
			<div class="container">
				<input type="text" class="color" name="color" value="" placeholder="FFFFFF" pattern="^[a-fA-F0-9]+$" minLength=6 maxLength=6 required title="Select Color" />
				<span class="hash">#</span>
				<span class="color-preview" title="Color Preview"><input type="color" value=""></span>
				<button type="button" class="random-color" title="Random Color"><i class="fas fa-random"></i></button>
			</div>
		</label>
	`;
	const $color = $(color);
	const hidden =
	`
		<label class="hidden">
			Hidden
			<select disabled>
				<option value="0" selected>false</option>
			</select>
		</label>
	`;
	const $hidden = $(hidden);

	$container.append($h1);
	$container.append($form);
	$form.append($name);
	$form.append($color);
	$form.append($hidden);

	return $container;
}

function renderEditTagForm(data)
{
	const $container = $('<div class="edit-tag-container" />');
	const $h1 = $(`<h1>Edit Tag #${data.id}</h1>`);
	const $form = $('<form onSubmit="return false;" />');
	const $id = $(`<input type="hidden" name="id" value="${data.id}">`);
	const $name = $(`<label class="name">Name<input type="text" class="name" name="name" value="${data.name}" placeholder="Documents" minLength=1 maxLength=64 required /></label>`);
	const color =
	`
		<label class="color">
			Color
			<div class="container">
				<input type="text" class="color" name="color" value="${data.color}" placeholder="FFFFFF" pattern="^[a-fA-F0-9]+$" minLength=6 maxLength=6 required title="Select Color" />
				<span class="hash">#</span>
				<span class="color-preview" title="Color Preview"><input type="color" value="${data.color}"></span>
				<button type="button" class="random-color" title="Random Color"><i class="fas fa-random"></i></button>
			</div>
		</label>
	`;
	const $color = $(color);
	const hiddenValue = String(Number(data.is_hidden));
	const hidden =
	`
		<label class="hidden">
			Hidden
			<select name="hidden">
				<option value="1" ${(hiddenValue==="1")?"selected":""}>true</option>
				<option value="0" ${(hiddenValue==="0")?"selected":""}>false</option>
			</select>
		</label>
	`;
	const $hidden = $(hidden);

	$container.append($h1);
	$container.append($form);
	$form.append($id);
	$form.append($name);
	$form.append($color);
	$form.append($hidden);

	return $container;
}

function updateAddTagState()
{
	const $container = $(".add-tag-modal");
	const $color = $container.find("input[name='color']");
	const $colorPicker = $container.find(".color-preview > input");
	const $colorPreview = $container.find(".color-preview");
	const $name = $container.find("input.name");
	const $confirm = $container.find("button.confirm-button");

	const colorValid = $color.is(":valid");
	const nameValid = $name.is(":valid");

	if(colorValid)
	{
		$colorPreview.css("background", "#"+$color.val());
		$colorPicker.val("#"+$color.val());
	}

	$confirm.prop("disabled", !(colorValid && nameValid));
}

function updateEditTagState()
{
	const $container = $(".edit-tag-modal");
	const $color = $container.find("input[name='color']");
	const $colorPicker = $container.find(".color-preview > input");
	const $colorPreview = $container.find(".color-preview");
	const $name = $container.find("input.name");
	const $hidden = $container.find("input.name");
	const $confirm = $container.find("button.confirm-button");

	const colorValid = $color.is(":valid");
	const nameValid = $name.is(":valid");
	const hiddenValid = $hidden.val().length > 0;

	if(colorValid)
	{
		$colorPreview.css("background", "#"+$color.val());
		$colorPicker.val("#"+$color.val());
	}

	$confirm.prop("disabled", !(colorValid && nameValid));
}
