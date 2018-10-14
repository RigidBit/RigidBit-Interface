import Footer from "../../components/Footer/Footer.jsx";
import Header from "../../components/Header/Header.jsx";
import Navigation from "../../components/Navigation/Navigation.jsx";

@observer class Component extends React.Component
{
	@observable data = [];
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

	handleViewBlockClick = (e) =>
	{
		e.preventDefault();

		router.navigate("block", {id: $(e.target).text()});
	};

	refreshClicked = action((e) =>
	{
		e.preventDefault();

		this.refreshData();

		$("section.statusContainer").addClass("loading");
	});

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

		api.getUrl(`/api/blocks/${store.routeParams.count}/${store.routeParams.offset}/1`, false)
		.then(function(data)
		{
			_this.updateData(data);

			$("section.statusContainer").removeClass("loading");
		});
	};

	renderBlocks = () =>
	{
		const _this = this;

		const tableRows = [];
		this.data.forEach(function(row, r)
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
			</section>
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
