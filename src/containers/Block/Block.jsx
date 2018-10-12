import Footer from "../../components/Footer/Footer.jsx";
import Header from "../../components/Header/Header.jsx";
import Navigation from "../../components/Navigation/Navigation.jsx";

@observer class Component extends React.Component
{
	@observable data = {};

	componentDidMount()
	{
		this.refreshData();
	}

	handleViewBlockClick = (e) =>
	{
		e.preventDefault();

		router.navigate("block", {id: $(e.target).text()});
		this.refreshData();
	};

	isDataReady = () =>
	{
		if(this.data.hasOwnProperty("info"))
			return true;

		return false;
	};

	updateData = action((data) =>
	{
		this.data = data;
		log.debug("UPDATE DATA:", this.data);
	});

	refreshData = () =>
	{
		const _this = this;

		api.getUrl(`/api/block/${store.routeParams.id}`, true)
		.then(function(data)
		{
			const dataNew = _.merge(mobx.toJS(_this.data), {info: data})
			_this.updateData(dataNew);

			$("section.statusContainer").removeClass("loading");
		});
	};

	renderBlock = () =>
	{
		const _this = this;

		if(!_this.isDataReady())
			return <div className="loadingText">Loading...</div>;

		const metrics =
		[
			["id", "ID"],
			["block_hash", "Block Hash"],
			["data_hash", "Data Hash"],
			["prev_hash", "Previous Hash"],
			["block_type", "Block Type"],
			["timestamp", "Block Time"],
			["version", "Block Version"],
		];

		const tableRows = [];
		metrics.forEach(function(metric, i)
		{
			const key = metric[0];
			const label = metric[1];
			let value = _this.data.info[metric[0]];

			if(key === "prev_hash")
				value = <a href={"#/block/" + value} onClick={_this.handleViewBlockClick}>{value}</a>

			if(key === "timestamp")
				value = new Date(parseInt(value) * 1000).toISOString();

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
			<section className="blockContainer">
		        <h2>Block Info</h2>
		        <table>
		        	<tbody>
    		        	{tableRows}
    		        </tbody>
		        </table>
			</section>
		);

		return html;
	};

	renderBlockTitle = () =>
	{
		if(!this.isDataReady())
			return null;

		return `Block #${this.data.info.id}`;
	};

	render()
	{
		const block = this.renderBlock();
		const blockTitle = this.renderBlockTitle();

		const html =
		(
			<section className="block">
				<Header />
				<Navigation />

				<div className="content">
					<h1>{blockTitle}</h1>
					{block}
				</div>

				<Footer />
			</section>
		);
		return html;
	}
}

export default Component;
