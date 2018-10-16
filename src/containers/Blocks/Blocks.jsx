import iziToast from "izitoast";

import {timestampToDate, valueOrZero} from "../../common/js/misc.js";

import Footer from "../../components/Footer/Footer.jsx";
import Header from "../../components/Header/Header.jsx";
import Navigation from "../../components/Navigation/Navigation.jsx";

@observer class Component extends React.Component
{
	@observable data = {};
	@observable showGenesisHash = false;
	autorun = null;
	refreshTimer = null;

	constructor(props)
	{
		super(props);

		this.controlType = React.createRef();
		this.controlCount = React.createRef();
		this.controlOffset = React.createRef();
	}

	componentDidMount()
	{
		this.autorun = mobx.autorun(()=>
		{
			this.refreshData();
		});

		this.startTimer();
	}

	componentWillUnmount()
	{
		if(this.autorun)
			this.autorun();

		this.clearTimer();
	}

	clearTimer = () =>
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
			offset: parseInt(store.routeParams.offset),
			type: this.controlType.current.value,
		};

		if(e.target === this.controlCount.current || e.target === this.controlType.current)
			params.offset = 0;

		router.navigate("blocks", params);
	};

	handleViewBlockClick = (e) =>
	{
		e.preventDefault();

		router.navigate("block", {id: $(e.target).text()});
	};

	handleViewTypeClick = (e) =>
	{
		e.preventDefault();

		const params =
		{
			count: parseInt(store.routeParams.count),
			offset: parseInt(store.routeParams.offset),
			type: String(e.target.dataset.type).toLowerCase(),
		};

		router.navigate("blocks", params);
	};

	handleOffsetUpdate = (modifier) =>
	{
		const params =
		{
			count: parseInt(this.controlCount.current.value),
			offset: parseInt(store.routeParams.offset),
			type: this.controlType.current.value,
		};

		const block_type_count_current = valueOrZero(this.data.block_type_count, params.type);

		params.offset += modifier;

		// This could result in an offset below zero. It must come before the "< 0" check. 
		if(params.offset >= block_type_count_current)
			params.offset = ((Math.ceil(block_type_count_current / params.count) - 1) * params.count);

		if(params.offset < 0)
			params.offset = 0;

		router.navigate("blocks", params);
	};

	isDataReady = () =>
	{
		return (this.data.hasOwnProperty("blocks") && this.data.hasOwnProperty("block_type_count"));
	};

	refreshClicked = action((e) =>
	{
		e.preventDefault();

		this.refreshData();
	});

	showHideGenesisClicked = action((e) =>
	{
		e.preventDefault();

		this.showGenesisHash = !this.showGenesisHash;
	});

	startTimer = () =>
	{
		this.refreshTimer = setInterval(this.timerTick, config.blocksRefreshInterval);
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

	refreshData = () =>
	{
		const _this = this;

		if(store.route !== "blocks")
			return false;

		let block_type = ("type" in store.routeParams) ? store.routeParams.type : "all";

		api.getUrl("/api/count-by-type", false)
		.then(function(data)
		{
			const dataNew = _.mapValues(_.keyBy(data.block_type_count, (i)=>i.block_type.toLowerCase()), "block_count");
			dataNew.all = data.block_count;
			dataNew.user = data.block_count_user;

			const newData = _.merge(mobx.toJS(_this.data), {block_type_count: null}, {block_type_count: dataNew});
			_this.updateData(newData);
		})
		.catch(function(error)
		{
			_this.updateData({});

			log.error(error);
			iziToast.error({title: "Error", message: "The specified block was not found."});
		});

		api.getUrl(`/api/blocks/${block_type}/${store.routeParams.count}/${store.routeParams.offset}/1`, false)
		.then(function(data)
		{
			const newData = _.merge(mobx.toJS(_this.data), {blocks: null}, {blocks: data});
			_this.updateData(newData);
		})
		.catch(function(error)
		{
			_this.updateData({});

			log.error(error);
			iziToast.error({title: "Error", message: "The specified block was not found."});
		});
	};

	renderBlocks = () =>
	{
		const _this = this;

		if(!this.isDataReady())
			return "Loading...";

		const tableRows = [];

		if(this.data.blocks.length === 0)
			tableRows.push(<tr key={0}><td className="empty-table" colSpan={4}>No data available to display.</td></tr>);
		else
			this.data.blocks.forEach(function(row, r)
			{
				const linkBlockType = `#/blocks/${store.routeParams.count}/${store.routeParams.offset}?type=${row.block_type.toLowerCase()}`;
				const linkId = "#/block/" + row.id;
				const linkHash = "#/block/" + row.hash;

				const html =
				(
					<tr key={r}>
						<td className="id item"><a href={linkId} onClick={_this.handleViewBlockClick}>{row.id}</a></td>
						<td className="hash item"><a href={linkHash} onClick={_this.handleViewBlockClick}>{row.hash}</a></td>
						<td className="block_type item"><a href={linkBlockType} data-type={row.block_type} onClick={_this.handleViewTypeClick}>{row.block_type}</a></td>
						<td className="timestamp item">{timestampToDate(row.timestamp)}</td>
					</tr>
				);
				tableRows.push(html);
			});

		const html =
		(
			<section className="blocksContainer">
		        <h2>Recent Blocks</h2>
		        <table>
		        	<thead>
		        		<tr>
			        		<th className="id">ID</th>
			        		<th className="hash">Block Hash</th>
			        		<th className="block_type">Block Type</th>
			        		<th className="timestamp">Timestamp</th>
			        	</tr>
		        	</thead>
		        	<tbody>
    		        	{tableRows}
    		        </tbody>
		        </table>
		        {this.renderControls()}
			</section>
		);

		return html;
	};

	renderControls = () =>
	{
		const block_type = ("type" in store.routeParams) ? store.routeParams.type : "all";
		const block_type_count = this.data.block_type_count;
		const block_type_count_current = valueOrZero(block_type_count, block_type);
		const count = store.routeParams.count;
		const offset = store.routeParams.offset;

		const pages = Math.ceil(block_type_count_current / count);
		const page = (block_type_count_current > 0) ? Math.ceil(offset / count) + 1 : 0;

		const disablePrevPageFast = (page <= 1);
		const disablePrevPage = (page <= 1);
		const disableNextPage = (page >= pages);
		const disableNextPageFast = (page >= pages);

		const html =
		(
			<div className="bottomControls">
				<div className="type control">
					<label>
						<span className="text">Block Type</span>
						<select ref={this.controlType} value={block_type} onChange={this.handleControlChange} title="Filter by Block Type">
							<option value="all">All ({valueOrZero(block_type_count, "all")})</option>
							<option value="user">All User ({valueOrZero(block_type_count, "user")})</option>
							<option value="file">File ({valueOrZero(block_type_count, "file")})</option>
							<option value="filehash">Filehash ({valueOrZero(block_type_count, "filehash")})</option>
							<option value="genesis">Genesis ({valueOrZero(block_type_count, "genesis")})</option>
							<option value="text">Text ({valueOrZero(block_type_count, "text")})</option>
							<option value="timestamp">Timestamp ({valueOrZero(block_type_count, "timestamp")})</option>
						</select>
					</label>
				</div>
				<div className="offset control">
					<button className="prev-page-fast" onClick={()=>{this.handleOffsetUpdate(-10 * count);}} disabled={disablePrevPageFast} title="Back 10 Pages"><i className="fas fa-angle-double-left"></i></button>
					<button className="prev-page" onClick={()=>{this.handleOffsetUpdate(-1 * count);}} disabled={disablePrevPage} title="Previous Page"><i className="fas fa-angle-left"></i></button>
					<span className="text">{page} of {pages}</span>
					<button className="next-page" onClick={()=>{this.handleOffsetUpdate(1 * count);}} disabled={disableNextPage} title="Next Page"><i className="fas fa-angle-right"></i></button>
					<button className="next-page-fast" onClick={()=>{this.handleOffsetUpdate(10 * count);}} disabled={disableNextPageFast} title="Forward 10 Pages"><i className="fas fa-angle-double-right"></i></button>
				</div>
				<div className="count control">
					<label>
						<span className="text">Show</span>
						<select ref={this.controlCount} value={count} onChange={this.handleControlChange} title="Max Rows Per Page">
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
		const blocks = this.renderBlocks();

		const html =
		(
			<section className="blocks">
				<Header />
				<Navigation />

				<div className="content">
					<h1>Blocks<a href="#refresh" className="refresh" onClick={this.refreshClicked} title="Refresh"><i className="fas fa-sync-alt"></i></a></h1>
					{blocks}
				</div>

				<Footer />
			</section>
		);
		return html;
	}
}

export default Component;
