import iziToast from "izitoast";

import * as htmlHelpers from "../../common/js/html.jsx";

class Component extends React.Component
{
	constructor(props)
	{
		super(props);

		this.syncForm = React.createRef();
		this.timestampForm = React.createRef();
	}

	handleClearCacheButtonClick = (e) =>
	{
		api.purgeCache();
		iziToast.success({title: "Success", message: "Cache has been cleared."});
	};

	handleSyncSubmitButtonClick = (e) =>
	{
		if(e) e.preventDefault();

		api.postUrl("/api/sync", null)
		.then(function(data)
		{
			const linkUrl = "/#/block/"+data.id;
			iziToast.success({title: "Success", message: `Sync block has been created.&nbsp; <a href="${linkUrl}">View</a>`});
		})
		.catch(function(error)
		{
			log.error(error);
			iziToast.error({title: "Error", message: error});
		});
	};

	handleTimestampSubmitButtonClick = (e) =>
	{
		if(e) e.preventDefault();

		api.postUrl("/api/timestamp", null)
		.then(function(data)
		{
			const linkUrl = "/#/block/"+data.id;
			iziToast.success({title: "Success", message: `Timestamp has been created.&nbsp; <a href="${linkUrl}">View</a>`});
		})
		.catch(function(error)
		{
			log.error(error);
			iziToast.error({title: "Error", message: error});
		});
	};

	renderCache = () =>
	{
		const html =
		(
			<div>
				<div className="description">
					Clear all local storage caches. During normal operation caches are pruned automatically. However, manual purges may be necessary if you operate more than one RigidBit backend simultaneously on the same host address.
				</div>
				<div className="button-container">
					<button type="button" className="clear-cache" onClick={this.handleClearCacheButtonClick} title="Clear Cache"><i className="far fa-trash-alt icon"></i>Clear Cache</button>
				</div>
			</div>
		);
		return htmlHelpers.renderContainer("cache-container", "Clear Cache", html);
	};

	renderSync = () =>
	{
		const html =
		(
			<div>
				<div className="description">
					Manually start a sync operation to peg with external blockchains.
				</div>
				<form ref={this.syncForm} action="/api/sync" method="post" encType="multipart/form-data">
					<div className="button-container">
						<button type="button" className="submit" onClick={this.handleSyncSubmitButtonClick} title="Start Sync"><i className="far fa-save icon"></i>Start Sync</button>
					</div>
				</form>
			</div>
		);
		return htmlHelpers.renderContainer("sync-container", "Sync", html);
	};

	renderTimestamp = () =>
	{
		const html =
		(
			<div>
				<div className="description">
					Create a manual timestamp entry in the blockchain.
				</div>
				<form ref={this.timestampForm} action="/api/timestamp" method="post" encType="multipart/form-data">
					<div className="button-container">
						<button type="button" className="submit" onClick={this.handleTimestampSubmitButtonClick} title="Create Timestamp"><i className="far fa-clock icon"></i>Create Timestamp</button>
					</div>
				</form>
			</div>
		);
		return htmlHelpers.renderContainer("timestamp-container", "Timestamp", html);
	};

	render()
	{
		const html =
		(
			<div>
				{this.renderSync()}
				{this.renderTimestamp()}
				{this.renderCache()}
			</div>
		);
		return html;
	}
}

export default Component;
