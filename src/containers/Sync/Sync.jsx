import filesize from "filesize";
import iziToast from "izitoast";

import * as api from "../../common/js/api.js";
import * as misc from "../../common/js/misc.js";
import * as htmlHelpers from "../../common/js/html.jsx";

import Footer from "../../components/Footer/Footer.jsx";
import Header from "../../components/Header/Header.jsx";
import Navigation from "../../components/Navigation/Navigation.jsx";

@observer class Component extends React.Component
{
	@observable data = {};
	autorun = null;
	refreshTimer = null;

	constructor(props)
	{
		super(props);

		this.controlCount = React.createRef();
		this.controlOffset = React.createRef();
	}

	componentDidMount()
	{
		this.autorun = mobx.autorun(()=>
		{
			this.refreshData();
		});

		this.startRefreshTimer();
	}

	componentWillUnmount()
	{
		if(this.autorun)
			this.autorun();

		this.clearRefreshTimer();
	}

	clearRefreshTimer = () =>
	{
		if(this.refreshTimer)
		{
			clearInterval(this.refreshTimer);
			this.refreshTimer = null;
		}
	};

	handleViewBlockClicked = (e) =>
	{
		e.preventDefault();

		router.navigate("block", {id: $(e.target).data("block-id")});
	};

	handleControlChange = (e) =>
	{
		const params =
		{
			count: parseInt(this.controlCount.current.value),
			offset: (e.target === this.controlOffset.current) ? parseInt(store.routeParams.offset) : 0,
		};

		router.navigate("sync", params);
	};

	handleOffsetUpdate = (modifier) =>
	{
		const params =
		{
			count: parseInt(this.controlCount.current.value),
			offset: parseInt(store.routeParams.offset),
		};

		const sync_records_count = this.data.sync_records_count;

		params.offset += modifier;

		// This could result in an offset below zero. It must come before the "< 0" check. 
		if(params.offset >= sync_records_count)
			params.offset = ((Math.ceil(sync_records_count / params.count) - 1) * params.count);

		if(params.offset < 0)
			params.offset = 0;

		router.navigate("sync", params);
	};

	isDataReady = () =>
	{
		if(this.data.hasOwnProperty("sync_records") && this.data.hasOwnProperty("sync_records_count"))
			return true;

		return false;
	};

	isDataValid = () =>
	{
		return this.isDataReady() && _.isObject(this.data.sync_records);
	};

	startRefreshTimer = () =>
	{
		this.refreshTimer = setInterval(this.timerTick, config.syncRefreshInterval);
	};

	timerTick = () =>
	{
		this.refreshData();
	};

	updateData = action((data) =>
	{
		this.data = data;

		log.debug("UPDATE DATA:", this.data);
	});

	refreshClicked = (e) =>
	{
		this.refreshData(false);
	};

	refreshData = (useCache=true) =>
	{
		const _this = this;

		if(store.route !== "sync")
			return false;

		api.getUrl(`/api/sync/${store.routeParams.count}/${store.routeParams.offset}/1`)
		.then(function(data)
		{
			const newData = _.merge(mobx.toJS(_this.data), {sync_records: null, sync_records_count: null}, data);
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

	renderSyncRecords = () =>
	{
		const _this = this;

		if(!this.isDataReady())
			return htmlHelpers.renderLoading();

		const tableRows = [];

		if(this.data.sync_records.length === 0)
			tableRows.push(<tr key={0}><td className="empty-table" colSpan={5}>No data available to display.</td></tr>);
		else
		{
			this.data.sync_records.forEach(function(row, r)
			{
				const block_id_link = (!_.isNull(row.sync_block_id)) ? <a href={"#/block/" + row.sync_block_id} data-block-id={row.sync_block_id} onClick={_this.handleViewBlockClicked}>{row.sync_block_id}</a> : null;
				const tx_hash_link = (!_.isNull(row.chain) && !_.isNull(row.tx_hash)) ? htmlHelpers.renderTransactionViewLink(row.chain, row.tx_hash, <React.Fragment><span className="full">{row.tx_hash}</span><span className="short">{row.tx_hash.substr(0,16)+"…"}</span></React.Fragment>) : null;

				const html =
				(
					<tr key={r}>
						<td className="block_id item">{block_id_link}</td>
						<td className="operation item">{row.operation}</td>
						<td className="chain item">{row.chain}</td>
						<td className="success item">{(row.success)?"true":"false"}</td>
						<td className="tx_hash item">{tx_hash_link}</td>
						<td className="timestamp item">{misc.timestampToDate(row.timestamp)}</td>
					</tr>
				);
				tableRows.push(html);
			});
		}

		const html =
		(
			<div className="sync-table-container">
				<table>
					<thead>
						<tr>
							<th className="block_id">ID</th>
							<th className="operation">OP</th>
							<th className="chain">Chain</th>
							<th className="success">Success</th>
							<th className="tx_hash">TX Hash</th>
							<th className="timestamp">Timestamp</th>
						</tr>
					</thead>
					<tbody>
						{tableRows}
					</tbody>
				</table>
			</div>
		);
		return htmlHelpers.renderContainer("sync-container", "Recent Sync Operations", html, this.renderControls());
	};

	renderControls = () =>
	{
		const sync_records_count = this.data.sync_records_count;
		const count = store.routeParams.count;
		const offset = store.routeParams.offset;

		const pages = Math.ceil(sync_records_count / count);
		const page = (sync_records_count > 0) ? Math.ceil(offset / count) + 1 : 0;

		const disablePrevPageFast = (page <= 1);
		const disablePrevPage = (page <= 1);
		const disableNextPage = (page >= pages);
		const disableNextPageFast = (page >= pages);
		const disableCount = (sync_records_count === 0);

		const html =
		(
			<div className="bottom-controls">
				<div className="offset control">
					<button type="button" className="prev-page-fast" onClick={()=>{this.handleOffsetUpdate(-10 * count);}} disabled={disablePrevPageFast} title="Back 10 Pages"><i className="fas fa-angle-double-left"></i></button>
					<button type="button" className="prev-page" onClick={()=>{this.handleOffsetUpdate(-1 * count);}} disabled={disablePrevPage} title="Previous Page"><i className="fas fa-angle-left"></i></button>
					<span className="text">{page} of {pages}</span>
					<button type="button" className="next-page" onClick={()=>{this.handleOffsetUpdate(1 * count);}} disabled={disableNextPage} title="Next Page"><i className="fas fa-angle-right"></i></button>
					<button type="button" className="next-page-fast" onClick={()=>{this.handleOffsetUpdate(10 * count);}} disabled={disableNextPageFast} title="Forward 10 Pages"><i className="fas fa-angle-double-right"></i></button>
				</div>
				<div className="count control">
					<label>
						<span className="text">Show</span>
						<select ref={this.controlCount} value={count} onChange={this.handleControlChange} title="Max Rows Per Page" disabled={disableCount}>
							<option value="10">10</option>
							<option value="25">25</option>
							<option value="50">50</option>
							<option value="75">75</option>
							<option value="100">100</option>
						</select>
					</label>
				</div>
			</div>
		);

		return html;
	};

	render()
	{
		const controls = this.renderControls();
		const syncRecords = this.renderSyncRecords();

		const html =
		(
			<section className="sync">
				<Header />
				<Navigation />
				<div className="content">
					<h1>
						Sync
						<div className="controls">
							<button type="button" className="refresh" onClick={this.refreshClicked} title="Refresh"><i className="fas fa-sync-alt"></i></button>
						</div>
					</h1>
					{syncRecords}
				</div>

				<Footer />
			</section>
		);
		return html;
	}
}

export default Component;
