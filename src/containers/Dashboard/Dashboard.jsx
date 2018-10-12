import iziToast from "../../../node_modules/izitoast/dist/js/iziToast.min.js";

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

		$("section.statusContainer").addClass("loading");
	});

	handleViewBlockClick = (e) =>
	{
		e.preventDefault();

		router.navigate("block", {id: $(e.target).text()});
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

			$("section.statusContainer").removeClass("loading");
		})
		.catch(function(error)
		{
			log.error(error);
			iziToast.error({title: "Error", message: error});
		});
	};

	renderStatus = () =>
	{
		const _this = this;

		const genesis_hash = (this.showGenesisHash) ? this.data.genesis_hash : this.data.genesis_hash.replace(/\w/g, "•");

		const metrics =
		[
			["connection", "Connection"],
			["genesis_hash", "Genesis Hash"],
			["block_height", "Block Height"],
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
				value = new Date(parseInt(value) * 1000).toISOString();

			else if(key === "block_height" || key === "last_hash")
				value = <a href={"#/block/" + value} onClick={_this.handleViewBlock}>{value}</a>;

			else if(key === "connection")
				value = <span>Established. <i className="fas fa-bolt"></i></span>;

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
			<section className="statusContainer">
		        <h2>General Status<a href="#refresh" className="refresh" onClick={this.refreshClicked}><i className="fas fa-sync-alt"></i></a></h2>
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
		let status;

		if(Object.keys(this.data).length === 0)
		{
			status = <div className="loadingText">Loading...</div>;
		}
		else
		{
			status = this.renderStatus();
		}

		const html =
		(
			<section className="dashboard">
				<Header />
				<Navigation />

				<div className="content">
					<h1>Dashboard</h1>
					{status}
				</div>

				<Footer />
			</section>
		);
		return html;
	}
}

export default Component;
