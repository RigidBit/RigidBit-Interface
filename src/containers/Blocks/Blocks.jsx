import iziToast from "izitoast";

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

		if(e.target === this.controlCount.current)
			params.offset = 0;

		router.navigate("blocks", params);
	};

	handleViewBlockClick = (e) =>
	{
		e.preventDefault();

		router.navigate("block", {id: $(e.target).text()});
	};

	handleOffsetUpdate = (modifier) =>
	{
		const params =
		{
			count: parseInt(this.controlCount.current.value),
			offset: parseInt(store.routeParams.offset),
			type: this.controlType.current.value,
		};
		params.offset += modifier;

		if(params.offset < 0)
			params.offset = 0;

		if(params.offset >= this.data.block_count)
			params.offset = ((Math.floor(this.data.block_count / params.count) - 0) * params.count);

		router.navigate("blocks", params);
	};

	isDataReady = () =>
	{
		return (this.data.hasOwnProperty("blocks") && this.data.hasOwnProperty("block_count"));
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

		api.getUrl("/api/count", false)
		.then(function(data)
		{
			const newData = _.merge(mobx.toJS(_this.data), data);
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

		if(this.data.blocks.length === 0)
			return "No block data available.";

		const tableRows = [];
		this.data.blocks.forEach(function(row, r)
		{
			const linkId = "#/block/" + row.id;
			const linkHash = "#/block/" + row.hash;

			const html =
			(
				<tr key={r}>
					<td className="id item"><a href={linkId} onClick={_this.handleViewBlockClick}>{row.id}</a></td>
					<td className="hash item"><a href={linkHash} onClick={_this.handleViewBlockClick}>{row.hash}</a></td>
					<td className="block_type item">{row.block_type}</td>
					<td className="timestamp item">{new Date(parseInt(row.timestamp) * 1000).toISOString()}</td>
				</tr>
			);
			tableRows.push(html);
		});

		const html =
		(
			<section className="blocksContainer">
		        <h2>Recent Blocks<a href="#refresh" className="refresh" onClick={this.refreshClicked}><i className="fas fa-sync-alt"></i></a></h2>
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
		const block_count = this.data.block_count;
		const count = store.routeParams.count;
		const offset = store.routeParams.offset;

		const pages = Math.ceil(block_count / count);
		const page = Math.ceil(offset / count) + 1;

		const disablePrevPageFast = (page <= 1);
		const disablePrevPage = (page <= 1);
		const disableNextPage = (page >= pages);
		const disableNextPageFast = (page >= pages);

		const html =
		(
			<div className="controls">
				<div className="type control">
					<label>
						<span className="text">Block Type</span>
						<select ref={this.controlType} value={block_type} onChange={this.handleControlChange}>
							<option value="all">All</option>
							<option value="file">File</option>
							<option value="filehash">Filehash</option>
							<option value="genesis">Genesis</option>
							<option value="text">Text</option>
							<option value="timestamp">Timestamp</option>
						</select>
					</label>
				</div>
				<div className="offset control">
					<button className="prev-page-fast" onClick={()=>{this.handleOffsetUpdate(-10 * count);}} disabled={disablePrevPageFast}><i className="fas fa-angle-double-left"></i></button>
					<button className="prev-page" onClick={()=>{this.handleOffsetUpdate(-1 * count);}} disabled={disablePrevPage}><i className="fas fa-angle-left"></i></button>
					<span className="text">{page} of {pages}</span>
					<button className="next-page" onClick={()=>{this.handleOffsetUpdate(1 * count);}} disabled={disableNextPage}><i className="fas fa-angle-right"></i></button>
					<button className="next-page-fast" onClick={()=>{this.handleOffsetUpdate(10 * count);}} disabled={disableNextPageFast}><i className="fas fa-angle-double-right"></i></button>
				</div>
				<div className="count control">
					<label>
						<span className="text">Show</span>
						<select ref={this.controlCount} value={count} onChange={this.handleControlChange}>
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
					<h1>Blocks</h1>
					{blocks}
				</div>

				<Footer />
			</section>
		);
		return html;
	}
}

export default Component;
