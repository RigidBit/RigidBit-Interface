import {decimalArrayToAscii} from "../../common/js/misc.js";

import Footer from "../../components/Footer/Footer.jsx";
import Header from "../../components/Header/Header.jsx";
import Navigation from "../../components/Navigation/Navigation.jsx";

@observer class Component extends React.Component
{
	@observable data = {};
	@observable routeParams = store.routeParams;

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
		if(this.data.hasOwnProperty("block"))
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

		api.getUrl(`/api/block-complete/${store.routeParams.id}`, true)
		.then(function(data)
		{
			_this.updateData(data);

			$("section.statusContainer").removeClass("loading");
		});
	};

	renderBlock = () =>
	{
		const _this = this;
		const data = _this.data.block;

		if(!_this.isDataReady())
			return this.renderLoading();

		const metrics =
		[
			["id", "ID"],
			["hash", "Block Hash"],
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
			let value = data[metric[0]];

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

		return this.renderContainerWithTable("blockContainer", "Block Info", tableRows);
	};

	renderBlockData = () =>
	{
		const _this = this;
		const data = _this.data.data;

		const containerClassName = "blockDataContainer";
		const containerTitle = "Block Data";

		if(!_this.isDataReady())
			return this.renderLoading();

		if(data === null)
			return this.renderEmptyContainer(containerClassName, containerTitle, "No data is available for this block.");

		const metrics =
		[
			// ["id", "ID"],
			// ["block_hash", "Block Hash"],
			["archive", "Archived"],
			["external", "External"],
			["data", "Data"],
			["data_hash", "Data Hash"],
			["timestamp", "Timestamp"],
		];

		const tableRows = [];
		metrics.forEach(function(metric, i)
		{
			const key = metric[0];
			const label = metric[1];
			let value = data[metric[0]];

			if(key === "archive" || key === "external")
				value = (value) ? "true" : "false";

			if(key === "data" && value !== null)
				value = decimalArrayToAscii(value);

			if(key === "timestamp")
				value = new Date(parseInt(value) * 1000).toISOString();

			if(value === null)
				value = <i>null</i>;

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

		return this.renderContainerWithTable("blockDataContainer", "Block Data", tableRows);
	};

	renderBlockMeta = () =>
	{
		const _this = this;
		const data = _this.data.meta;

		const containerClassName = "blockMetaContainer";
		const containerTitle = "Block Meta Data";

		if(!_this.isDataReady())
			return this.renderLoading();

		if(data.length === 0)
			return this.renderEmptyContainer(containerClassName, containerTitle, "No meta data is available for this block.");

		const metrics =
		[
			// ["id", "ID"],
			// ["block_hash", "Block Hash"],
			["name", "Name"],
			["value", "Value"],
			["timestamp", "Timestamp"],
		];

		const tables = [];
		data.forEach(function(meta, m)
		{
			const tableRows = [];
			metrics.forEach(function(metric, i)
			{
				const key = metric[0];
				const label = metric[1];
				let value = meta[metric[0]];

				if(key === "timestamp")
					value = new Date(parseInt(value) * 1000).toISOString();

				if(value === null)
					value = <i>null</i>;

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

			tables.push(_this.renderTableWithRows(tableRows, m));
		});

		return this.renderContainer(containerClassName, containerTitle, tables);
	};

	renderBlockTitle = () =>
	{
		if(!this.isDataReady())
			return null;

		return `Block #${this.data.block.id}`;
	};

	renderContainer = (containerClassName, title, content) =>
	{
		const html =
		(
			<section className={containerClassName}>
				<h2>{title}</h2>
				{content}
			</section>
		);

		return html;
	};

	renderContainerWithTable = (containerClassName, title, tableRows) =>
	{
		return this.renderContainer(containerClassName, title, this.renderTableWithRows(tableRows));
	};

	renderEmptyContainer = (containerClassName, title, content) =>
	{
		const html =
		(
			<section className={containerClassName}>
				<h2>{title}</h2>
				{content}
			</section>
		);

		return html;
	};

	renderTableWithRows = (tableRows, key=null) =>
	{
		const html =
		(
			<table key={key} className="reverse-row-colors">
				<tbody>
					{tableRows}
				</tbody>
			</table>
		);

		return html;
	};

	renderLoading = () =>
	{
		return <div className="loadingText">Loading...</div>;
	};

	render()
	{
		const blockTitle = this.renderBlockTitle();
		const block = this.renderBlock();
		const blockData = this.renderBlockData();
		const blockMeta = this.renderBlockMeta();

		const html =
		(
			<section className="block">
				<Header />
				<Navigation />

				<div className="content">
					<h1>{blockTitle}</h1>
					{block}
					{blockData}
					{blockMeta}
				</div>

				<Footer />
			</section>
		);
		return html;
	}
}

export default Component;
