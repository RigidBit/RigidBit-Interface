import iziToast from "izitoast";
import PropTypes from "prop-types";

import * as confirm from "../../components/Confirm/confirm.js";
import * as htmlHelpers from "../../common/js/html.jsx";
import * as misc from "../../common/js/misc.js";
import Table from "../../components/Table/Table.jsx";

@observer class Component extends React.Component
{
	@observable data = {};
	refreshTimer = null;

	componentDidMount()
	{
		this.props.refreshSubscribe("chain", this.refreshClicked, true);
		this.refreshData();
	}

	componentWillUnmount()
	{
		this.props.refreshSubscribe("chain", this.refreshClicked, false);
		this.refreshTimerInit(false);
	}

	handleVerifyStartButtonClick = (e) =>
	{
		if(e) e.preventDefault();

		this.startVerification();
		this.refreshTimerInit(true);
	};

	isDataReady = () =>
	{
		return _.has(mobx.toJS(this.data), "verify_chain");
	};

	updateData = action((data) =>
	{
		this.data = data;
		log.debug("UPDATE DATA:", this.data);
	});

	verifyInit = () =>
	{
		this.verify.current.addEventListener("change", this.handleVerifyChange);
	};

	refreshClicked = (e) =>
	{
		if(e) e.preventDefault();

		this.refreshData();
	};

	refreshData = (useCache=false, background=false) =>
	{
		const _this = this;

		if(!store.route.startsWith("verify"))
			return false;

		api.getUrl("/api/verify_chain", useCache, background)
		.then(function(data)
		{
			// Make sure the refresh timer is in the correct state.
			_this.refreshTimerInit(_.get(data, "running", null) === true);

			const newData = _.merge(mobx.toJS(_this.data), {verify_chain: null}, {verify_chain: data});
			_this.updateData(newData);
		})
		.catch(function(error)
		{
			_this.refreshDataFailure(error);
		});
	};

	refreshDataFailure = (error) =>
	{
		this.updateData({});

		log.error(error);
		iziToast.error({title: "Error", message: error});
	};

	refreshTimerInit = (start=false) =>
	{
		if(this.refreshTimer)
		{
			clearInterval(this.refreshTimer);
			this.refreshTimer = null;
		}

		if(start)
		{
			this.refreshTimer = setInterval(()=>this.refreshData(false, true), config.verifyRefreshInterval);
		}
	};

	renderMessages = () =>
	{
		if(!this.isDataReady())
			return null;

		const data = mobx.toJS(this.data);

		if(!_.isArray(data.verify_chain.messages))
			return null;

		const rows = [];
		const messages = data.verify_chain.messages;
		messages.forEach(function(message, m)
		{
			const html = <div className="message" key={m}>{message}</div>;
			rows.push(html);
		});

		if(_.isNumber(data.verify_chain.timestamp))
		{
			const html =
			(
				<div className="message last-run" key={99999}>
					Last Run: {misc.timestampToDate(data.verify_chain.timestamp)}
				</div>
			);
			rows.push(html);
		}

		return htmlHelpers.renderContainer("verify-chain-messages-container", "Output", rows);
	};

	startVerification = () =>
	{
		const _this = this;

		api.postUrl("/api/verify_chain", null, false, true)
		.then(function(data)
		{
			const newData = _.merge(mobx.toJS(_this.data), {verify_chain: null}, {verify_chain: data});
			_this.updateData(newData);
		})
		.catch(function(error)
		{
			_this.refreshDataFailure(error);
		});
	};

	renderVerify = () =>
	{
		if(!this.isDataReady())
			return null;

		const isRunning = this.data.verify_chain.running;
		const buttonText = (isRunning) ? "Verification Running" : "Start Verification";
		const buttonDisabled = isRunning;

		const html =
		(
			<div>
				<div className="description">
					Verify the integrity of the blockchain, all data, and verify sync pegs with external chains.
					This operation is very CPU and data intensive. It may degrade system performance while executing.
				</div>
				<div className="button-container">
					<button type="button" className="start" onClick={this.handleVerifyStartButtonClick} title="Start Chain Verification" disabled={buttonDisabled}><i className="fas fa-check icon"></i><span>{buttonText}</span></button>
				</div>
			</div>
		);
		return htmlHelpers.renderContainer("verify-chain-container", "Verify Chain", html);
	};

	render()
	{
		if(!this.isDataReady())
			return htmlHelpers.renderLoading();

		const verify = this.renderVerify();
		const messages = this.renderMessages();

		const html =
		(
			<React.Fragment>
				{verify}
				{messages}
			</React.Fragment>
		);
		return html;
	}
}

Component.defaultProps =
{
};

Component.propTypes =
{
	refreshSubscribe: PropTypes.func,
};

export default Component;
