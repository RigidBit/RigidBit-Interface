import PropTypes from "prop-types";
import ReactModal from 'react-modal';

@observer class ChangePasswordModal extends React.Component
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

	handleRequestClose = (e) =>
	{
		this.handleCancelClicked(e);
	};

	handleSaveClicked = (e) =>
	{
		if(e) e.preventDefault();

		const data = $(this.form.current).serializeObject();

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
		const html =
		(
			<ReactModal
				isOpen={this.modalOpen}
				onRequestClose={this.handleRequestClose}
				closeTimeoutMS={300}
				contentLabel="Change Password Modal"
				className={{base: "ReactModal__Content change-password-modal", afterOpen: "ReactModal__Content--after-open", beforeClose: "ReactModal__Content--before-close"}}
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
					<h1>Change Password</h1>

					<form ref={this.form}>
						<label className="old_password">
							Current Password
							<input type="password" className="old_password" name="old_password" minLength="1" maxLength="64" autoComplete="password" placeholder="current password" required={true} />
						</label>

						<label className="password">
							New Password
							<input type="password" className="new_password" name="new_password" minLength="1" maxLength="64" autoComplete="new-password" placeholder="new password" required={true} />
						</label>
					</form>

				</div>
				<div className="footer">
					<button type="button" className="cancel-button" onClick={this.handleCancelClicked}>Cancel</button>
					<button type="button" className="confirm-button" onClick={this.handleSaveClicked}>Save</button>
				</div>
			</ReactModal>
		);
		return html;
	}
}

ChangePasswordModal.defaultProps =
{
};

ChangePasswordModal.propTypes =
{
	onCancel: PropTypes.func,
	onConfirm: PropTypes.func,
};

export {ChangePasswordModal};
