import filesize from "filesize";
import iziToast from "izitoast";
import PropTypes from "prop-types";

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
		this.props.refreshSubscribe("files", this.refreshData, true);

		this.autorun = mobx.autorun(()=>
		{
			this.refreshData();
		});

		this.startRefreshTimer();
	}

	componentWillUnmount()
	{
		this.props.refreshSubscribe("files", this.refreshData, false);

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

	handleControlChange = (e) =>
	{
		const params =
		{
			count: parseInt(this.controlCount.current.value),
			offset: (e.target === this.controlOffset.current) ? parseInt(store.routeParams.offset) : 0,
			subsection: "files",
		};

		router.navigate("monitor.subsection", params);
	};

	handleOffsetUpdate = (modifier) =>
	{
		const params =
		{
			subsection: store.routeParams.subsection,
			count: parseInt(this.controlCount.current.value),
			offset: parseInt(store.routeParams.offset),
		};

		const monitor_records_count = this.data.monitor_history_file_records_count;

		params.offset += modifier;

		// This could result in an offset below zero. It must come before the "< 0" check. 
		if(params.offset >= monitor_records_count)
			params.offset = ((Math.ceil(monitor_records_count / params.count) - 1) * params.count);

		if(params.offset < 0)
			params.offset = 0;

		router.navigate(store.route, params);
	};

	isDataReady = () =>
	{
		if(this.data.hasOwnProperty("monitor_history_file_records") && this.data.hasOwnProperty("monitor_history_file_records_count"))
			return true;

		return false;
	};

	isDataValid = () =>
	{
		return this.isDataReady() && _.isObject(this.data.monitor_history_file_records);
	};

	startRefreshTimer = () =>
	{
		this.refreshTimer = setInterval(this.timerTick, config.monitorRefreshInterval);
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

		if(!store.route.startsWith("monitor"))
			return false;

		api.getUrl(`/api/monitor-file-history/${store.routeParams.count}/${store.routeParams.offset}/1`)
		.then(function(data)
		{
			const newData = _.merge(mobx.toJS(_this.data), {monitor_records: null, monitor_records_count: null}, data);
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

	renderMonitorRecords = () =>
	{
		const _this = this;

		if(!this.isDataReady())
			return htmlHelpers.renderLoading();

		const tableRows = [];

		if(this.data.monitor_history_file_records.length === 0)
			tableRows.push(<tr key={0}><td className="empty-table" colSpan={5}>No data available to display.</td></tr>);
		else
			this.data.monitor_history_file_records.forEach(function(row, r)
			{
				const block_id_link = <a href={"#" + router.buildPath("block", {id: row.block_id})}>{row.block_id}</a>;
				const filename = misc.filenameFromPath(row.file_path);
				const filename_link = <a href={"#" + router.buildPath("search", {q: "\"filename:"+filename+"\""})}>{filename}</a>;

				const html =
				(
					<tr key={r}>
						<td className="block_id item">{block_id_link}</td>
						<td className="filename item">{filename_link}</td>
						<td className="file_path item">{htmlHelpers.createSearchPath(row.file_path)}</td>
						<td className="file_size item">{filesize(row.file_size)}</td>
						<td className="last_modified item">{misc.timestampToDate(row.last_modified)}</td>
						<td className="timestamp item">{misc.timestampToDate(row.timestamp_updated)}</td>
					</tr>
				);
				tableRows.push(html);
			});

		const html =
		(
			<div className="monitor-table-container">
				<table>
					<thead>
						<tr>
							<th className="block_id">ID</th>
							<th className="filename">Filename</th>
							<th className="file_path">File Path</th>
							<th className="file_size">Filesize</th>
							<th className="last_modified">Last Modified</th>
							<th className="timestamp">Timestamp</th>
						</tr>
					</thead>
					<tbody>
						{tableRows}
					</tbody>
				</table>
			</div>
		);
		return htmlHelpers.renderContainer("monitor-files-container", "Recent File Changes", html, this.renderControls());
	};

	renderControls = () =>
	{
		const monitor_records_count = this.data.monitor_history_file_records_count;
		const count = store.routeParams.count;
		const offset = store.routeParams.offset;

		const pages = Math.ceil(monitor_records_count / count);
		const page = (monitor_records_count > 0) ? Math.ceil(offset / count) + 1 : 0;

		const disablePrevPageFast = (page <= 1);
		const disablePrevPage = (page <= 1);
		const disableNextPage = (page >= pages);
		const disableNextPageFast = (page >= pages);
		const disableCount = (monitor_records_count === 0);

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
		return this.renderMonitorRecords();
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
