import PropTypes from "prop-types";
import ReactModal from 'react-modal';

@observer class SettingsAddApiKeyModal extends React.Component
{
	@observable modalOpen = true;

	constructor(props)
	{
		super(props);

		this.form = React.createRef();
	}

	handleRequestClose = (e) =>
	{
		this.handleCancelClicked(e);
	};

	handleAddClicked = (e) =>
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

	renderUserSelect = () =>
	{
		const data = _.sortBy(this.props.data, (o)=>o.username.toLowerCase());

		const options = [];
		data.forEach(function(user, u)
		{
			const html = <option key={u} value={user.id}>{user.username}</option>;
			options.push(html);
		})

		return <select name="user_id">{options}</select>;
	};

	render()
	{
		const confirmButtonTitle = "Add";
		const title = "Add API Key";

		const html =
		(
			<ReactModal
				isOpen={this.modalOpen}
				onRequestClose={this.handleRequestClose}
				closeTimeoutMS={300}
				contentLabel="Add API Key Modal"
				className={{base: "ReactModal__Content add-api-key-modal", afterOpen: "ReactModal__Content--after-open", beforeClose: "ReactModal__Content--before-close"}}
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
						<label className="user">
							User
							{this.renderUserSelect()}
						</label>
					</form>

				</div>
				<div className="footer">
					<button type="button" className="cancel-button" onClick={this.handleCancelClicked}>Cancel</button>
					<button type="button" className="confirm-button" onClick={this.handleAddClicked}>{confirmButtonTitle}</button>
				</div>
			</ReactModal>
		);
		return html;
	}
}

SettingsAddApiKeyModal.defaultProps =
{
};

SettingsAddApiKeyModal.propTypes =
{
	data: PropTypes.array,
	onCancel: PropTypes.func,
	onConfirm: PropTypes.func,
};

export {SettingsAddApiKeyModal};
