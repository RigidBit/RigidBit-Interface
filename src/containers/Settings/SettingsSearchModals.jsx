import PropTypes from "prop-types";
import ReactModal from 'react-modal';

import * as misc from "../../common/js/misc.js";

@observer class SettingsAddEditSearchModal extends React.Component
{
	@observable modalOpen = true;

	constructor(props)
	{
		super(props);

		this.form = React.createRef();
	}

	componentDidMount()
	{
	}

	componentWillUnmount()
	{
	}

	getDefaultValues = () =>
	{
		const isEditMode = _.isObject(this.props.editData);
		const defaultValues =
		{
			label: "",
			search: "",
		};

		if(isEditMode)
		{
			defaultValues.label = this.props.editData.value.label;
			defaultValues.search = this.props.editData.value.search;
		}

		return defaultValues;
	}

	handleRequestClose = (e) =>
	{
		this.handleCancelClicked(e);
	};

	handleAddEditClicked = (e) =>
	{
		if(e) e.preventDefault();

		const isEditMode = _.isObject(this.props.editData);
		const data = $(this.form.current).serializeObject();
		if(isEditMode) data.id = this.props.editData.id;

		action(()=>{this.modalOpen = false;})();

		setTimeout(()=>
		{
			this.props.onConfirm(data);
		}, 310);
	};

	handleCancelClicked = (e) =>
	{
		if(e) e.preventDefault();

		action(()=>{this.modalOpen = false;})();

		setTimeout(()=>
		{
			this.props.onCancel();
		}, 310);
	};

	render()
	{
		const isEditMode = _.isObject(this.props.editData);
		const defaultValues = this.getDefaultValues();

		const confirmButtonTitle = (!isEditMode) ? "Add" : "Save";
		const fieldsRequired = true;
		const labelLabel = "Label";
		const searchLabel = "Search";
		const labelPlaceholder = "label";
		const searchPlaceholder = "search terms";
		const title = (!isEditMode) ? "Add Saved Search" : `Edit Saved Search #${this.props.editData.id}`;

		const html =
		(
			<ReactModal
				isOpen={this.modalOpen}
				onRequestClose={this.handleRequestClose}
				closeTimeoutMS={300}
				contentLabel="Add Search Modal"
				className={{base: "ReactModal__Content add-search-modal", afterOpen: "ReactModal__Content--after-open", beforeClose: "ReactModal__Content--before-close"}}
				overlayClassName={{base: "ReactModal__Overlay", afterOpen: "ReactModal__Overlay--after-open", beforeClose: "ReactModal__Overlay--before-close"}}
				portalClassName={"ReactModalPortal"}
				ariaHideApp={false}
				shouldFocusAfterRender={true}
				shouldCloseOnOverlayClick={true}
				shouldCloseOnEsc={true}
				shouldReturnFocusAfterClose={false}
				parentSelector={()=>document.body}
			>
				<div className="content">
					<h1>{title}</h1>

					<form ref={this.form}>
						<label className="label">
							{labelLabel}
							<input type="text" className="label" name="label" defaultValue={defaultValues.label} placeholder={labelPlaceholder} minLength="1" maxLength="64" autoComplete="off" required={fieldsRequired} />
						</label>

						<label className="search">
							{searchLabel}
							<input type="text" className="search" name="search" defaultValue={defaultValues.search} placeholder={searchPlaceholder} minLength="1" maxLength="512" autoComplete="off" required={fieldsRequired} />
						</label>
					</form>

				</div>
				<div className="footer">
					<button type="button" className="cancel-button" onClick={this.handleCancelClicked}>Cancel</button>
					<button type="button" className="confirm-button" onClick={this.handleAddEditClicked}>{confirmButtonTitle}</button>
				</div>
			</ReactModal>
		);
		return html;
	}
}

SettingsAddEditSearchModal.defaultProps =
{
};

SettingsAddEditSearchModal.propTypes =
{
	editdata: PropTypes.object,
	onCancel: PropTypes.func,
	onConfirm: PropTypes.func,
};

export {SettingsAddEditSearchModal};
