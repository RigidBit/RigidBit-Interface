import {uintToString} from "../../common/js/misc.js";
import filesize from "filesize";
import iziToast from "izitoast";

import Footer from "../../components/Footer/Footer.jsx";
import Header from "../../components/Header/Header.jsx";
import Navigation from "../../components/Navigation/Navigation.jsx";

@observer class Component extends React.Component
{
	@observable data = {};
	autorun = null;

	componentDidMount()
	{
		this.autorun = mobx.autorun(()=>
		{
			this.refreshData();
		});
	}

	componentWillUnmount()
	{
		if(this.autorun)
			this.autorun();
	}

	handleNextPrevButtonClick = (e) =>
	{
		e.preventDefault();

		const modifier = e.currentTarget.dataset.modifier;
		let id = parseInt(this.data.block.id) + parseInt(modifier);

		if(id < 1)
			id = 1;

		if(id > this.data.block_count)
			id = this.data.block_count;

		router.navigate("block", {id: id});
	}

	handleViewBlockClick = (e) =>
	{
		e.preventDefault();

		router.navigate("block", {id: $(e.currentTarget).text()});
	};

	isDataReady = () =>
	{
		if(this.data.hasOwnProperty("block") && this.data.hasOwnProperty("block_count"))
			return true;

		return false;
	};

	isDataValid = () =>
	{
		return this.isDataReady() && typeof this.data.block === "object" && this.data.block !== null && typeof this.data.block_count === "number";
	};

	updateData = action((data) =>
	{
		this.data = data;
		log.debug("UPDATE DATA:", this.data);
	});

	refreshClicked = (e) =>
	{
		if(e)
			e.preventDefault();

		this.refreshData(false);
	};

	refreshData = (useCache=true) =>
	{
		const _this = this;

		if(store.route !== "block")
			return false;

		if(!("id" in store.routeParams))
			return false;

		api.getUrl(`/api/count`, false)
		.then(function(data)
		{
			const newData = _.merge(mobx.toJS(_this.data), data);
			_this.updateData(newData);
		})
		.catch(function(error)
		{
			const newData = _.merge(mobx.toJS(_this.data), {block_count: null});
			_this.updateData(newData);

			log.error(error);
			iziToast.error({title: "Error", message: "Unable to get the block count."});
		});

		api.getUrl(`/api/block-complete/${store.routeParams.id}`, useCache)
		.then(function(data)
		{
			const newData = _.merge(mobx.toJS(_this.data), {block: null, data: null, meta: null}, data);
			_this.updateData(newData);
		})
		.catch(function(error)
		{
			const newData = _.merge(mobx.toJS(_this.data), {block: null, data: null, meta: null});
			_this.updateData(newData);

			log.error(error);
			iziToast.error({title: "Error", message: "The specified block was not found."});
		});
	};

	renderBlock = () =>
	{
		const _this = this;
		const data = _this.data.block;

		const containerClassName = "blockContainer";
		const containerTitle = "Block Info";

		if(!_this.isDataReady())
			return this.renderLoading();

		if(!_this.isDataValid())
			return this.renderEmptyContainer(containerClassName, containerTitle, "The specified block was not found.");

		const metrics =
		[
			["id", "ID"],
			["hash", "Block Hash"],
			["data_hash", "Data Hash"],
			["prev_hash", "Previous Hash"],
			["block_type", "Block Type"],
			["timestamp", "Block Time"],
			// ["version", "Block Version"],
			["verified", "Verify"],
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

			if(key === "verified")
				value = _this.renderBlockVerify();

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

		return this.renderContainerWithTable(containerClassName, containerTitle, tableRows);
	};

	renderBlockData = () =>
	{
		const _this = this;
		const data = _this.data.data;

		const containerClassName = "blockDataContainer";
		const containerTitle = "Block Data";

		if(!_this.isDataReady())
			return this.renderLoading();

		if(!_this.isDataValid() || data === null)
			return this.renderEmptyContainer(containerClassName, containerTitle, "No data is available for this block.");

		const metrics =
		[
			// ["id", "ID"],
			// ["block_hash", "Block Hash"],
			["archive", "Archived"],
			// ["external", "External"],
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
			{
				value = uintToString(value).replace(/\r/g, "");
				value = value.split("\n").map((item, key) =>
				{
					const html =
					(
						<span key={key}>
							{item}
							<br />
						</span>
					);
					return html;
				});
				value = <div className="data-container">{value}</div>;
			}

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

		return this.renderContainerWithTable(containerClassName, containerTitle, tableRows);
	};

	renderBlockMeta = () =>
	{
		const _this = this;
		const data = _this.data.meta;

		const containerClassName = "blockMetaContainer";
		const containerTitle = "Block Meta Data";

		if(!_this.isDataReady())
			return this.renderLoading();

		if(!_this.isDataValid() || data.length === 0)
			return this.renderEmptyContainer(containerClassName, containerTitle, "No meta data is available for this block.");

		const tableRows = [];
		data.forEach(function(meta, m)
		{
			const label = meta["name"];
			let value = meta["value"];

			if("name" in meta && meta["name"] === "filesize")
			{
				if(parseInt(value) >= 1024)
					value = `${filesize(value)} (${parseInt(value).toLocaleString()} bytes)`;
				else
					value = filesize(value);
			}

			if(value === null)
				value = <i>null</i>;

			const html =
			(
				<tr key={m}>
					<td className="metric">{label}:</td>
					<td className="value">{value}</td>
					<td className="empty" />
				</tr>
			);
			tableRows.push(html);
		});

		// Add a single timestamp to the end. Use the first meta data entry for this.
		const html =
		(
			<tr key="timestamp">
				<td className="metric">Timestamp:</td>
				<td className="value">{new Date(parseInt(data[0]["timestamp"]) * 1000).toISOString()}</td>
				<td className="empty" />
			</tr>
		);
		tableRows.push(html);

		return this.renderContainerWithTable(containerClassName, containerTitle, tableRows);
	};

	renderBlockVerify = () =>
	{
		if(!("block" in this.data))
			return null;

		const results =
		{
			valid: <span className="success">Success</span>,
			invalid: <span className="failure">Failed</span>,
			pending: <a href="#verify" onClick={this.verifyBlock}>Click to Verify</a>,
		};

		let status = "pending";
		if("verified" in this.data.block)
			status = (this.data.block.verified === true) ? "valid" : "invalid";

		return results[status];
	};

	renderControls = () =>
	{
		let prevButton = null;
		let nextButton = null;

		if(this.isDataReady() && this.isDataValid())
		{
			const disablePrevBlock = (this.data.block.id === 1);
			const disableNextBlock = (this.data.block.id === this.data.block_count); 
			prevButton = <button className="prev-block" data-modifier={-1} onClick={this.handleNextPrevButtonClick} disabled={disablePrevBlock}><i className="fas fa-angle-left"></i></button>;
			nextButton = <button className="next-block" data-modifier={1} onClick={this.handleNextPrevButtonClick} disabled={disableNextBlock}><i className="fas fa-angle-right"></i></button>;
		}

		const html =
		(
			<div className="controls">
				{prevButton}
				{nextButton}
				<a href="#refresh" className="refresh" onClick={this.refreshClicked}><i className="fas fa-sync-alt"></i></a>
			</div>
		);
		return html;
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

	renderTitle = () =>
	{
		if(!this.isDataReady())
			return null;

		if(!this.isDataValid())
			return "Block N/A";

		return `Block #${this.data.block.id}`;
	};

	verifyBlock = (e) =>
	{
		e.preventDefault();

		const _this = this;

		api.getUrl(`/api/verify/${_this.data.block.id}`, false)
		.then(function(data)
		{
			const newData = _.merge({block: {verified: data}}, mobx.toJS(_this.data));
			_this.updateData(newData);
		})
		.catch(function(error)
		{
			log.error(error);
			iziToast.error({title: "Error", message: error});
		});
	};

	render()
	{
		const blockTitle = this.renderTitle();
		const block = this.renderBlock();
		const blockData = this.renderBlockData();
		const blockMeta = this.renderBlockMeta();
		const controls = this.renderControls();

		const html =
		(
			<section className="block">
				<Header />
				<Navigation />
				<div className="content">
					<h1>
						{blockTitle}
						{controls}
					</h1>
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
