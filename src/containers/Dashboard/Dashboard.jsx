import iziToast from "izitoast";
import {Doughnut as DoughnutChart} from "react-chartjs-2";
import {Line as LineChart} from "react-chartjs-2";
import {Bar as BarChart} from "react-chartjs-2";

import * as charts from "../../common/js/charts.js";
import * as misc from "../../common/js/misc.js";
import {timestampToDate} from "../../common/js/misc.js";

import Footer from "../../components/Footer/Footer.jsx";
import Header from "../../components/Header/Header.jsx";
import Navigation from "../../components/Navigation/Navigation.jsx";

@observer class Component extends React.Component
{
	@observable data = {};
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

	refreshClicked = action((e) =>
	{
		e.preventDefault();

		this.clearTimer();
		this.refreshData();
		this.startTimer();
	});

	handleViewBlockClickedClick = (e) =>
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

		const chartDataFiltered = _.cloneDeep(charts.dataBaseSet1);
		this.data.block_type_count.forEach(function(item)
		{
			if(item.block_type !== "Genesis" && item.block_type !== "Timestamp")
			{
				chartDataFiltered.labels.push(item.block_type);
				chartDataFiltered.datasets[0].data.push(item.block_count);
			}
		});

		const chartData = _.cloneDeep(charts.dataBaseSet1);
		this.data.block_type_count.forEach(function(item)
		{
			chartData.labels.push(item.block_type);
			chartData.datasets[0].data.push(item.block_count);
		});

		const chartOptions = _.cloneDeep(charts.optionsBase);
		chartOptions.title.text = "All Blocks";

		const chartOptionsFiltered = _.cloneDeep(charts.optionsBase);
		chartOptionsFiltered.title.text = "User Blocks";

		const html =
		(
			<section className="block-type-counts-container">
				<h2>Block Types</h2>
				<div className="blockTypeCountsFilteredChart chart">
					<DoughnutChart data={chartDataFiltered} options={chartOptionsFiltered} redraw />
				</div>
				<div className="blockTypeCountsChart chart">
					<DoughnutChart data={chartData} options={chartOptions} />
				</div>
			</section>
		);

		return html;
	};

	renderBlockTypeUsageDaily = () =>
	{
		if(!this.isDataReady())
			return null;

		const types = ["file", "filehash", "text", "timestamp"];
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

			if(type === "timestamp")
				chartData.datasets[t].hidden = true;

			dates.forEach(function(date)
			{
				chartData.datasets[t].data.push(block_type_usage_daily[date][type]);
			});
		});

		const chartOptions = _.cloneDeep(charts.optionsBase);
		chartOptions.title.display = false;

		const html =
		(
			<section className="block-type-usage-daily-container">
				<h2>Block Types by Date</h2>
				<div className="chart">
					<LineChart data={chartData} options={chartOptions} height={100} />
				</div>
			</section>
		);
		return html;
	};

	renderBlockTypeUsageHourly = () =>
	{
		if(!this.isDataReady())
			return null;

		const types = ["file", "filehash", "text", "timestamp"];
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

			if(type === "timestamp")
				chartData.datasets[t].hidden = true;

			dates.forEach(function(date)
			{
				chartData.datasets[t].data.push(block_type_usage_hourly[date][type]);
			});
		});

		const chartOptions = _.cloneDeep(charts.optionsBase);
		chartOptions.title.display = false;

		const html =
		(
			<section className="block-type-usage-daily-container">
				<h2>Block Types by Hour</h2>
				<div className="chart">
					<BarChart data={chartData} options={chartOptions} height={100} />
				</div>
			</section>
		);
		return html;
	};

	renderStatus = () =>
	{
		const _this = this;

		if(!this.isDataReady())
			return <div className="loading-text">Loading...</div>;

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
				value = <a href={"#/block/" + value} onClick={_this.handleViewBlockClicked}>{value}</a>;

			else if(key === "last_type")
				value = <a href={`#/blocks/${config.navigationDefaultBlocksParams.count}/${config.navigationDefaultBlocksParams.offset}?type=${value.toLowerCase()}`} data-type={value} onClick={_this.handleViewTypeClicked}>{value}</a>;

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
			<section className="status-container">
				<h2>General Status</h2>
				<table className="reverse-row-colors">
					<tbody>
						{tableRows}
					</tbody>
				</table>
			</section>
		);
		return html;
	};

	render()
	{
		const status = this.renderStatus();
		const blockTypeCounts = this.renderBlockTypeCounts();
		const blockTypeUsageDaily = this.renderBlockTypeUsageDaily();
		const blockTypeUsageHourly = this.renderBlockTypeUsageHourly();

		const html =
		(
			<section className="dashboard">
				<Header />
				<Navigation />

				<div className="content">
					<h1>Dashboard<a href="#refresh" className="refresh" onClick={this.refreshClicked} title="Refresh"><i className="fas fa-sync-alt"></i></a></h1>
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
