import iziToast from "izitoast";
import {Doughnut as DoughnutChart} from "react-chartjs-2";
import {Line as LineChart} from "react-chartjs-2";
import {Bar as BarChart} from "react-chartjs-2";

import * as charts from "../../common/js/charts.js";
import * as htmlHelpers from "../../common/js/html.jsx";
import * as misc from "../../common/js/misc.js";
import {timestampToDate} from "../../common/js/misc.js";

import Footer from "../../components/Footer/Footer.jsx";
import Header from "../../components/Header/Header.jsx";
import Navigation from "../../components/Navigation/Navigation.jsx";

@observer class Component extends React.Component
{
	@observable data = {};
	@observable expandBlockTypeUsageDaily = false;
	@observable expandBlockTypeUsageHourly = false;
	@observable showGenesisHash = false;
	refreshTimer = null;

	componentDidMount()
	{
		this.clearTimer();
		this.refreshData();
		this.startTimer();
	}

	componentWillUnmount()
	{
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

	expandClicked = action((e, id) =>
	{
		if(e) e.preventDefault();

		this[id] = !this[id];
	});

	refreshClicked = action((e) =>
	{
		e.preventDefault();

		this.clearTimer();
		this.refreshData();
		this.startTimer();
	});

	handleViewBlockClicked = (e) =>
	{
		e.preventDefault();

		router.navigate("block", {id: $(e.target).text()});
	};

	handleViewTypeClicked = (e) =>
	{
		e.preventDefault();

		const params =
		{
			count: config.navigationDefaultBlocksParams.count,
			offset: config.navigationDefaultBlocksParams.offset,
			type: String(e.target.dataset.type).toLowerCase(),
		};

		router.navigate("blocks", params);
	};

	isDataReady = () =>
	{
		return (Object.keys(this.data).length > 0);
	};

	showHideGenesisClicked = action((e) =>
	{
		e.preventDefault();

		this.showGenesisHash = !this.showGenesisHash;
	});

	startTimer = () =>
	{
		this.refreshTimer = setInterval(this.timerTick, config.dashboardStatusRefreshInterval);
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

		api.getUrl("/api/status", false)
		.then(function(data)
		{
			_this.updateData(data);
		})
		.catch(function(error)
		{
			log.error(error);
			iziToast.error({title: "Error", message: error});
		});
	};

	renderBlockTypeCounts = () =>
	{
		if(!this.isDataReady())
			return null;

		// Sort data by configured ordering.
		const dashboardBlockTypesDisplayOrder = ["data", "delete", "email", "file", "filehash", "hash", "text", "timestamp", "sync"];
		let data = mobx.toJS(this.data.block_type_count);
		data = _.sortBy(data, function(item)
		{
			return _.indexOf(dashboardBlockTypesDisplayOrder, item.block_type.toLowerCase());
		});

		const blockTypes = ["data", "delete", "email", "file", "filehash", "hash", "text", "sync", "timestamp"];
		const blockTypesFiltered = ["data", "email", "file", "filehash", "hash", "text"];

		const chartData = _.cloneDeep(charts.dataBaseSet1);
		data.forEach(function(item)
		{
			if(_.includes(blockTypes, item.block_type.toLowerCase()))
			{
				chartData.labels.push(item.block_type);
				chartData.datasets[0].data.push(item.block_count);
			}
		});

		const chartDataFiltered = _.cloneDeep(charts.dataBaseSet1);
		data.forEach(function(item)
		{
			if(_.includes(blockTypesFiltered, item.block_type.toLowerCase()))
			{
				chartDataFiltered.labels.push(item.block_type);
				chartDataFiltered.datasets[0].data.push(item.block_count);
			}
		});

		const chartOptions = _.cloneDeep(charts.optionsBase1);
		chartOptions.title.text = "All Blocks";

		const chartOptionsFiltered = _.cloneDeep(charts.optionsBase1);
		chartOptionsFiltered.title.text = "User Blocks";

		const html1 =
		(
			<div className="blockTypeCountsChart chart">
				<DoughnutChart data={chartData} options={chartOptions} />
			</div>
		);
		const html2 =
		(
			<div className="blockTypeCountsFilteredChart chart">
				<DoughnutChart data={chartDataFiltered} options={chartOptionsFiltered} redraw />
			</div>
		);
		return htmlHelpers.renderContainer("block-type-counts-container", "Block Types", html1, html2);
	};

	renderBlockTypeUsageDaily = () =>
	{
		if(!this.isDataReady())
			return null;

		const types = ["data", "delete", "email", "file", "filehash", "hash", "text", "timestamp", "sync"];
		const dates = Object.keys(this.data.block_type_usage_daily).sort();
		const block_type_usage_daily = _.mapValues(mobx.toJS(this.data.block_type_usage_daily), function(date)
		{
			const block_type_count = _.keyBy(date, function(block_type_count)
			{
				return block_type_count.block_type.toLowerCase();
			});
			return _.mapValues(block_type_count, "block_count");
		});

		const chartData = _.cloneDeep(charts.dataBaseSet2);
		dates.forEach(function(date)
		{
			chartData.labels.push(date);
		});
		types.forEach(function(type, t)
		{
			chartData.datasets[t] = {};
			chartData.datasets[t].label = misc.ucwords(type);
			chartData.datasets[t].backgroundColor = charts.colorsDefault[t];
			chartData.datasets[t].borderColor = charts.colorsDefault[t];
			chartData.datasets[t].fill = false;
			chartData.datasets[t].data = [];

			// if(type === "timestamp")
			// 	chartData.datasets[t].hidden = true;

			dates.forEach(function(date)
			{
				chartData.datasets[t].data.push(block_type_usage_daily[date][type]);
			});
		});

		const chartOptions = _.cloneDeep(charts.optionsBase2);
		chartOptions.title.display = false;

		const section = "expandBlockTypeUsageDaily";
		const chartExpandButton = this.renderChartExpandButton(section);

		let containerClassName = ["block-type-usage-daily-container"];
		if(this[section]) containerClassName.push("expanded");
		containerClassName = containerClassName.join(" ");

		let chartClassName = ["chart"];
		if(this[section]) chartClassName.push("expanded");
		chartClassName = chartClassName.join(" ");

		const html =
		(
			<React.Fragment>
				{chartExpandButton}
				<div className={chartClassName}>
					<LineChart data={chartData} options={chartOptions} />
				</div>
			</React.Fragment>
		);
		return htmlHelpers.renderContainer(containerClassName, `Block Types by Date (${config.statusUsageDays}d)`, html);
	};

	renderChartExpandButton = (section) =>
	{
		let buttonClassNames = ["expand-button"];
		if(this[section]) buttonClassNames.push("expanded");
		buttonClassNames = buttonClassNames.join(" ");

		const expandIcon = (this[section]) ? <i className="fas fa-compress"></i> : <i className="fas fa-expand"></i>;

		const html =
		(
			<button type="button" className={buttonClassNames} onClick={(e)=>this.expandClicked(e, section)}>
				{expandIcon}
			</button>
		);
		return html;
	};

	renderBlockTypeUsageHourly = () =>
	{
		if(!this.isDataReady())
			return null;

		const types = ["data", "delete", "email", "file", "filehash", "hash", "text", "timestamp", "sync"];
		const dates = Object.keys(this.data.block_type_usage_hourly).sort();
		const block_type_usage_hourly = _.mapValues(mobx.toJS(this.data.block_type_usage_hourly), function(date)
		{
			const block_type_count = _.keyBy(date, function(block_type_count)
			{
				return block_type_count.block_type.toLowerCase();
			});
			return _.mapValues(block_type_count, "block_count");
		});

		const chartData = _.cloneDeep(charts.dataBaseSet2);
		dates.forEach(function(date)
		{
			chartData.labels.push(date);
		});
		types.forEach(function(type, t)
		{
			chartData.datasets[t] = {};
			chartData.datasets[t].label = misc.ucwords(type);
			chartData.datasets[t].backgroundColor = charts.colorsDefault[t];
			chartData.datasets[t].borderColor = charts.colorsDefault[t];
			chartData.datasets[t].fill = false;
			chartData.datasets[t].data = [];

			// if(type === "timestamp")
			// 	chartData.datasets[t].hidden = true;

			dates.forEach(function(date)
			{
				chartData.datasets[t].data.push(block_type_usage_hourly[date][type]);
			});
		});

		const chartOptions = _.cloneDeep(charts.optionsBase2);
		chartOptions.title.display = false;

		const section = "expandBlockTypeUsageHourly";
		const chartExpandButton = this.renderChartExpandButton(section);

		let containerClassName = ["block-type-usage-hourly-container"];
		if(this[section]) containerClassName.push("expanded");
		containerClassName = containerClassName.join(" ");

		let chartClassName = ["chart"];
		if(this[section]) chartClassName.push("expanded");
		chartClassName = chartClassName.join(" ");

		const html =
		(
			<React.Fragment>
				{chartExpandButton}
				<div className={chartClassName}>
					<BarChart data={chartData} options={chartOptions} />
				</div>
			</React.Fragment>
		);
		return htmlHelpers.renderContainer(containerClassName, `Block Types by Hour (${config.statusUsageDays}d)`, html);
	};

	renderNotifications = () =>
	{
		if(!this.isDataReady())
			return null;

		const notifications = mobx.toJS(this.data.notifications);

		if(notifications.length === 0)
			return null;

		const rows = [];
		for(let n in notifications)
		{
			let notification = notifications[n];

			let classes = "";
			const matches = notification.match(/^([\w]+:)/);
			if(_.isObject(matches)) // If a "prefix:" was used.
			{
				const prefix = matches[1];
				classes = prefix.replace(":", "").toLowerCase(); // Set class to prefix.
				notification = <React.Fragment><span className="prefix">{prefix}</span> {notification.replace(prefix, "")}</React.Fragment>; // Add prefix class to prefix string.
			}

			const html = <div key={n} className={classes}>{notification}</div>;
			rows.push(html);
		}
		return htmlHelpers.renderContainer("notifications-container", "Notifications", rows);
	};

	renderStatus = () =>
	{
		const _this = this;

		if(!this.isDataReady())
			return htmlHelpers.renderLoading();

		const genesis_hash = (this.showGenesisHash) ? this.data.genesis_hash : this.data.genesis_hash.replace(/\w/g, "•");

		const metrics =
		[
			["connection", "Connection"],
			["genesis_hash", "Genesis Hash"],
			["block_height", "Last Block ID"],
			["last_hash", "Last Block Hash"],
			["last_type", "Last Block Type"],
			["last_timestamp", "Last Block Time"],
			["rigidbit_version", "RigidBit Version"],
		];

		const tableRows = [];
		metrics.forEach(function(metric, i)
		{
			let key = metric[0];
			let label = metric[1];
			let value = _this.data[metric[0]];

			if(key === "genesis_hash")
			{
				if(!_this.showGenesisHash)
					value = value.replace(/\w/g, "•");

				value = <span>{value} <a href="#showHideGenesis" onClick={_this.showHideGenesisClicked}><i className="far fa-eye-slash"></i></a></span>;
			}

			else if(key === "last_timestamp")
				value = timestampToDate(value);

			else if(key === "block_height" || key === "last_hash")
				value = <a href={router.buildUrl("block", {id: value})}>{value}</a>;

			else if(key === "last_type")
				value = <a href={router.buildUrl("blocks", {...config.navigationDefaultBlocksParams, type: value.toLowerCase()})}>{value}</a>;

			else if(key === "connection")
				value = <span>Active <i className="fas fa-bolt"></i></span>;

			const html =
			(
				<tr key={i}>
					<td className={key + " metric"}>{label}:</td>
					<td className={key + " value"}>{value}</td>
					<td className="empty" />
				</tr>
			);
			tableRows.push(html);
		});

		const html =
		(
			<table className="reverse-row-colors">
				<tbody>
					{tableRows}
				</tbody>
			</table>
		);
		return htmlHelpers.renderContainer("status-container", "General Status", html);
	};

	render()
	{
		const status = this.renderStatus();
		const blockTypeCounts = this.renderBlockTypeCounts();
		const blockTypeUsageDaily = this.renderBlockTypeUsageDaily();
		const blockTypeUsageHourly = this.renderBlockTypeUsageHourly();
		const notifications = this.renderNotifications();

		const html =
		(
			<section className="dashboard">
				<Header />
				<Navigation />

				<div className="content">
					<h1>
						Dashboard
						<div className="controls">
							<button type="button" className="refresh" onClick={this.refreshClicked} title="Refresh"><i className="fas fa-sync-alt"></i></button>
						</div>
					</h1>
					{notifications}
					{status}
					{blockTypeCounts}
					{blockTypeUsageDaily}
					{blockTypeUsageHourly}
				</div>

				<Footer />
			</section>
		);
		return html;
	}
}

export default Component;
