import filesize from "filesize";
import iziToast from "izitoast";

import * as api from "../../common/js/api.js"; 
import * as misc from "../../common/js/misc.js"; 
import {uintToString, timestampToDate} from "../../common/js/misc.js";

import Footer from "../../components/Footer/Footer.jsx";
import Header from "../../components/Header/Header.jsx";
import Navigation from "../../components/Navigation/Navigation.jsx";

@observer class Component extends React.Component
{
	@observable data = {};
	@observable expandDataPreviewImage = false;
	autorun = null;
	validDataPreviewExtensions = ["png", "jpg", "jpeg", "gif", "svg"];

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

	handleBlockDataPreviewImageClick = (e) =>
	{
		e.preventDefault();

		action(()=>
		{
			this.expandDataPreviewImage = !this.expandDataPreviewImage;
			console.log(this.expandDataPreviewImage);
		})();
	};

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
	};

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

	isDataPreviewAvailable = () =>
	{
		const data = this.data;
		const validExtensions = this.validDataPreviewExtensions;

		if(!this.isDataReady())
			return false;

		if(!this.isDataValid())
			return false;

		if(data.block.block_type.toLowerCase() != "file" || data.data.archive !== true || data.meta === null || data.meta.length === 0)
			return false;

		let extension = null;
		for(let i = 0; i < data.meta.length; ++i)
		{
			if("name" in data.meta[i] && data.meta[i].name === "filename")
			{
				extension = misc.filenameExtension(data.meta[i].value);
				break;
			}
		}

		if(!extension || !_.includes(validExtensions, extension))
			return false;

		return true;
	};

	updateData = action((data) =>
	{
		this.data = data;
		log.debug("UPDATE DATA:", this.data);

		// Set the default expand to false every time data is changed.
		this.expandDataPreviewImage = false;
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

		const containerClassName = "block-container";
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
				value = timestampToDate(value);

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

		const containerClassName = "block-data-container";
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
				value = timestampToDate(value);

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

		if(data.archive === true)
		{
			const html =
			(
				<tr key="download">
					<td className={"download metric"}>Download:</td>
					<td className={"download value"}>
						<a href={api.apiUrlFromRelativePath("/api/file-download/"+data.id)} target="_blank">Click to Download</a>
					</td>
					<td className="empty" />
				</tr>
			);
			tableRows.push(html);
		}

		return this.renderContainerWithTable(containerClassName, containerTitle, tableRows);
	};

	renderBlockMeta = () =>
	{
		const _this = this;
		const data = _this.data.meta;

		const containerClassName = "block-meta-container";
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
				<td className="value">{timestampToDate(data[0]["timestamp"])}</td>
				<td className="empty" />
			</tr>
		);
		tableRows.push(html);

		return this.renderContainerWithTable(containerClassName, containerTitle, tableRows);
	};

	renderBlockDataPreview = () =>
	{
		const data = this.data;

		const containerClassName = "block-preview-container";
		const containerTitle = "Block Data Preview";
		const imageExtensions = this.validDataPreviewExtensions;

		if(!this.isDataPreviewAvailable())
			return null;

		let extension = null;
		for(let i = 0; i < data.meta.length; ++i)
		{
			if("name" in data.meta[i] && data.meta[i].name === "filename")
			{
				extension = misc.filenameExtension(data.meta[i].value);
				break;
			}
		}

		if(!extension || !_.includes(imageExtensions, extension))
			return null;

		const imgSrc = api.apiUrlFromRelativePath("/api/file-download/"+data.block.id);
		const expanded = (this.expandDataPreviewImage) ? " expanded" : "";
		const html =
		(
			<div className={"image-container" + expanded}>
				<img src={imgSrc} alt="Image Preview" onClick={this.handleBlockDataPreviewImageClick} title="Click to Expand" />
			</div>
		);
		return this.renderContainer(containerClassName, containerTitle, html);
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
			prevButton = <button className="prev-block" data-modifier={-1} onClick={this.handleNextPrevButtonClick} disabled={disablePrevBlock} title="Previous Block"><i className="fas fa-angle-left"></i></button>;
			nextButton = <button className="next-block" data-modifier={1} onClick={this.handleNextPrevButtonClick} disabled={disableNextBlock} title="Next Block"><i className="fas fa-angle-right"></i></button>;
		}

		const html =
		(
			<div className="controls">
				{prevButton}
				{nextButton}
				<a href="#refresh" className="refresh" onClick={this.refreshClicked} title="Refresh"><i className="fas fa-sync-alt"></i></a>
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
		return <div className="loading-text">Loading...</div>;
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
		const blockPreview = this.renderBlockDataPreview();
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
					{blockPreview}
				</div>

				<Footer />
			</section>
		);
		return html;
	}
}

export default Component;
