import PropTypes from "prop-types";
import ReactModal from 'react-modal';

@observer class SettingsAddEditUserModal extends React.Component
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
			username: "",
			password: "",
			is_admin: 0,
			is_disabled: 0,
		};

		if(isEditMode)
		{
			// defaultValues.username = this.props.editData.username;
			// defaultValues.password = this.props.editData.password;
			defaultValues.is_admin = this.props.editData.is_admin ? 1 : 0;
			defaultValues.is_disabled = this.props.editData.is_disabled ? 1 : 0;
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
		const fieldsRequired = !isEditMode;
		const usernameLabel = (!isEditMode) ? "Username" : "New Username";
		const passwordLabel = (!isEditMode) ? "Password" : "New Password";
		const usernamePlaceholder = (!isEditMode) ? "username" : "leave blank to remain unchanged";
		const passwordPlaceholder = (!isEditMode) ? "password" : "leave blank to remain unchanged";
		const title = (!isEditMode) ? "Add User" : `Edit User - "${this.props.editData.username}"`;

		const html =
		(
			<ReactModal
				isOpen={this.modalOpen}
				onRequestClose={this.handleRequestClose}
				closeTimeoutMS={300}
				contentLabel="Add User Modal"
				className={{base: "ReactModal__Content add-user-modal", afterOpen: "ReactModal__Content--after-open", beforeClose: "ReactModal__Content--before-close"}}
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
						<label className="username">
							{usernameLabel}
							<input type="text" className="username" name="username" defaultValue={defaultValues.username} placeholder={usernamePlaceholder} minLength="1" maxLength="64" autoComplete="username" required={fieldsRequired} />
						</label>

						<label className="password">
							{passwordLabel}
							<input type="password" className="password" name="password" defaultValue={defaultValues.password} placeholder={passwordPlaceholder} minLength="1" maxLength="64" autoComplete="new-password" required={fieldsRequired} />
						</label>

						<label className="admin">
							Admin
							<select name="is_admin" defaultValue={defaultValues.is_admin}>
								<option value="0">false</option>
								<option value="1">true</option>
							</select>
						</label>

						<label className="disabled">
							Disabled
							<select name="is_disabled" defaultValue={defaultValues.is_disabled}>
								<option value="0">false</option>
								<option value="1">true</option>
							</select>
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

SettingsAddEditUserModal.defaultProps =
{
};

SettingsAddEditUserModal.propTypes =
{
	editdata: PropTypes.object,
	onCancel: PropTypes.func,
	onConfirm: PropTypes.func,
};

export {SettingsAddEditUserModal};
