import filesize from "filesize";
import iziToast from "izitoast";
import Select from "react-select";

import * as api from "../../common/js/api.js";
import * as htmlHelpers from "../../common/js/html.jsx";
import * as misc from "../../common/js/misc.js";
import * as reactSelect from "../../common/js/react-select.js";

import Footer from "../../components/Footer/Footer.jsx";
import Header from "../../components/Header/Header.jsx";
import Navigation from "../../components/Navigation/Navigation.jsx";

@observer class Component extends React.Component
{
	@observable data = {};
	@observable expandDataPreviewImage = false;
	@observable selectedTags = [];
	@observable tagsEditModeEnabled = false;
	autorun = null;
	dataPreviewImageExtensions = config.dataPreviewImageExtensions;
	dataPreviewMovieExtensions = config.dataPreviewMovieExtensions;
	dataPreviewDocumentExtensions = config.dataPreviewDocumentExtensions;
	validDataPreviewExtensions = _.concat(this.dataPreviewImageExtensions, this.dataPreviewMovieExtensions, this.dataPreviewDocumentExtensions);
	textBlockInlineViewThreshold = 1024;

	componentDidMount()
	{
		this.autorun = mobx.autorun(()=>
		{
			this.refreshData();
		});

		this.registerKeypressHandler(true);
	}

	componentWillUnmount()
	{
		if(this.autorun)
			this.autorun();

		this.registerKeypressHandler(false);
	}

	dataArrayToString = (data) =>
	{
		return misc.uintToString(data);
	};

	dataArrayToFormattedJson = (data) =>
	{
		let json = this.dataArrayToString(data);
		json = JSON.stringify(JSON.parse(json), null, 4);
		json = json.replace(/[ ]{4}/g, "    ");

		return this.dataStringToFormattedText(json);
	};

	dataArrayToFormattedText = (data) =>
	{
		return this.dataStringToFormattedText(this.dataArrayToString(data));
	};

	dataStringToFormattedText = (data) =>
	{
		const value = data.replace(/\r/g, "").split("\n").map((item, key) =>
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
		return value;
	};

	dataArrayToHexString = (data) =>
	{
		return misc.decimalArrayToHex(data);
	};

	filenameExtensionFromBlockMetaData = (metaData) =>
	{
		let extension = null;
		for(let i = 0; i < metaData.length; ++i)
		{
			if(metaData[i].hasOwnProperty("name") && metaData[i].name === "filename")
			{
				extension = misc.filenameExtension(metaData[i].value).toLowerCase();
				break;
			}
		}
		return extension;
	}

	generateTagSelectOptions = (data, showHidden=true) =>
	{
		if(!data)
			return [];

		if(!showHidden)
			data = data.filter((item)=>!item.is_hidden);

		const selectOptions = data.map(function(item, i)
		{
			const option =
			{
				color: item.color,
				label: item.name,
				value: item.id,
			};
			return option;
		});

		return _.sortBy(selectOptions, "label");
	};

	handleBlockDataPreviewImageClick = (e) =>
	{
		e.preventDefault();

		action(()=>
		{
			this.expandDataPreviewImage = !this.expandDataPreviewImage;
		})();
	};

	handleEditTagsClick = (e) =>
	{
		e.preventDefault();

		this.updateSelectedTags(this.generateTagSelectOptions(this.data.tags));

		action(()=>
		{
			this.tagsEditModeEnabled = true;
		})();
	};

	handleEditTagsCancel = (e) =>
	{
		action(()=>
		{
			this.tagsEditModeEnabled = false;
		})();
	};

	handleEditTagsSave = (e) =>
	{
		const _this = this;

		let data = this.selectedTags.map(function(tag)
		{
			return tag.value;
		});
		data = {tags: data};

		api.putUrlJson(`/api/tags-for-block/${_this.data.block.id}`, data)
		.then(function(data)
		{
			const newData = _.merge(mobx.toJS(_this.data), {tags: null}, {tags: data});
			_this.updateData(newData);

			action(()=>
			{
				_this.tagsEditModeEnabled = false;
			})();

			api.removeCache(`/api/block-complete/${_this.data.block.id}?inlinetext=true`, "GET");
		})
		.catch(function(error)
		{
			_this.refreshDataFailure(error);
		});
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

	isBlockDataAvailable = () =>
	{
		if(this.isDataReady() && this.isDataValid() && this.data.hasOwnProperty("data") && this.data.data !== null)
			return true;

		return false;
	};

	isBlockMetaAvailable = () =>
	{
		if(this.isDataReady() && this.isDataValid() && this.data.hasOwnProperty("meta") && _.isArray(mobx.toJS(this.data.meta)) && this.data.meta.length > 0)
			return true;

		return false;
	};

	isBlockTagsAvailable = () =>
	{
		if(this.isDataReady() && this.isDataValid() && _.has(this.data, "tagsAvailable"))
			return true;

		return false;
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

		const block_type = data.block.type.toLowerCase();
		if(block_type != "file" && block_type != "text")
			return false;

		if(block_type == "file" && (data.data.archive !== true || data.meta === null || data.meta.length === 0))
			return false;

		if(block_type == "file")
		{
			const extension = this.filenameExtensionFromBlockMetaData(data.meta);
			if(!extension || !_.includes(validExtensions, extension.toLowerCase()))
				return false;
		}

		if(block_type == "text" && data.data.data.length <= this.textBlockInlineViewThreshold)
			return false;

		return true;
	};

	registerKeypressHandler = (addHandler) =>
	{
		const _this = this;

		if(addHandler)
		{
			$(document).on("keydown", function(e)
			{
				let modifier;

				if(!e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey)
				{
					if(e.key === "ArrowLeft")
					{
						e.preventDefault();
						modifier = -1;
					}
					else if(e.key === "ArrowRight")
					{
						e.preventDefault();
						modifier = 1;
					}

					if(e.key === "ArrowLeft" || e.key === "ArrowRight")
					{
						let id = parseInt(_this.data.block.id) + modifier;

						if(id < 1) id = 1;
						if(id > _this.data.block_count) id = _this.data.block_count;

						router.navigate("block", {id: id});
					}
				}
			});
		}
		else
		{
			$(document).off("keydown");
		}
	};

	updateData = action((data) =>
	{
		this.data = data;
		this.updateSelectedTags(this.generateTagSelectOptions(this.data.tags));

		log.debug("UPDATE DATA:", this.data);

		// Set the defaults every time data is changed.
		this.expandDataPreviewImage = false;
		this.tagsEditModeEnabled = false;
	});

	updateSelectedTags = action((data) =>
	{
		this.selectedTags = data;
	});

	refreshClicked = (e) =>
	{
		this.refreshData(false);
	};

	refreshData = (useCache=true) =>
	{
		const _this = this;

		if(store.route !== "block")
			return false;

		if(!("id" in store.routeParams))
			return _this.refreshDataFailure("ID not found in route parameters.");

		api.getUrl(`/api/count`, false) // We do not use cache here because this allow the next/prev buttons to always be accurate.
		.then(function(data)
		{
			const newData = _.merge(mobx.toJS(_this.data), {block_count: null}, data);
			_this.updateData(newData);
		})
		.catch(function(error)
		{
			_this.refreshDataFailure(error);
		});

		api.getUrl(`/api/block-complete/${store.routeParams.id}?inlinetext=true`, useCache)
		.then(function(data)
		{
			const newData = _.merge(mobx.toJS(_this.data), {block: null, data: null, meta: null, tags: null, inline: null}, data);

			// TODO: This is a compatibility fix with the previous block structure. It should be reinvestigated.
			if(newData.inline !== null) { newData.data.data = newData.inline; }

			_this.updateData(newData);
		})
		.catch(function(error)
		{
			_this.refreshDataFailure(error);
		});

		api.getUrl(`/api/tags`, useCache)
		.then(function(data)
		{
			const newData = _.merge(mobx.toJS(_this.data), {tagsAvailable: null}, {tagsAvailable: data});
			_this.updateData(newData);
		})
		.catch(function(error)
		{
			_this.refreshDataFailure(error);
		});
	};

	refreshDataFailure = (error) =>
	{
		this.updateData({block: null, data: null, meta: null, tags: null, inline: null, block_count: null});

		log.error(error);
		iziToast.error({title: "Error", message: error});
	};

	renderBlock = () =>
	{
		const _this = this;
		const data = _this.data.block;

		const containerClassName = "block-container";
		const containerTitle = "Block Info";

		if(!_this.isDataReady())
			return htmlHelpers.renderLoading();

		if(!_this.isDataValid())
			return htmlHelpers.renderContainer(containerClassName, containerTitle, "The specified block was not found.");

		const metrics =
		[
			["id", "ID"],
			["hash", "Block Hash"],
			["data_hash", "Data Hash"],
			["meta_hash", "Meta Hash"],
			["prev_hash", "Previous Hash"],
			["type", "Block Type"],
			["timestamp", "Timestamp"],
			// ["version", "Block Version"],
			["verified", "Verify"],
		];

		const tableRows = [];
		metrics.forEach(function(metric, i)
		{
			const key = metric[0];
			const label = metric[1];
			let value = data[metric[0]];

			if(key === "id" || key === "hash")
				value = <a href={router.buildUrl("block", {id: value})}>{value}</a>;

			if(key === "prev_hash" && data.id !== 1)
				value = <a href={router.buildUrl("block", {id: value})}>{value}</a>;

			else if(key === "data_hash" && data.id !== 1)
				value = <a href={router.buildUrl("search", {q: "data_hash:"+value})}>{value}</a>;

			else if(key === "meta_hash" && data.id !== 1)
				value = <a href={router.buildUrl("search", {q: "meta_hash:"+value})}>{value}</a>;

			else if(key === "type")
				value = <a href={router.buildUrl("blocks", {...config.navigationDefaultBlocksParams, type: value.toLowerCase()})}>{value}</a>;

			else if(key === "timestamp")
				value = misc.timestampToDate(value);

			else if(key === "verified")
				value = _this.renderBlockVerify();

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

		return htmlHelpers.renderContainerWithTable(containerClassName, containerTitle, tableRows);
	};

	renderBlockData = () =>
	{
		const _this = this;
		const data = _this.data.data;

		const containerClassName = "block-data-container";
		const containerTitle = "Block Data";

		if(!_this.isDataReady())
			return htmlHelpers.renderLoading();

		if(!_this.isDataValid())
			return null;

		if(!_this.isBlockDataAvailable())
			return null;
			// return htmlHelpers.renderContainer(containerClassName, containerTitle, "No data is available for this block.");

		const block_type = this.data.block.type.toLowerCase();
		const hashBlock = block_type === "hash";
		const syncBlockAndValidJson = block_type === "sync" && misc.isJson(this.dataArrayToString(data.data));

		const metrics =
		[
			// ["id", "ID"],
			// ["block_hash", "Block Hash"],
			["archive", "Archived"],
			// ["external", "External"],
			["data", "Data"],
			["data_hash", "Data Hash"],
			// ["timestamp", "Timestamp"],
		];

		const tableRows = [];
		metrics.forEach(function(metric, i)
		{
			const key = metric[0];
			const label = metric[1];
			let value = mobx.toJS(data[metric[0]]);

			if(key === "archive" || key === "external")
				value = (value) ? "true" : "false";

			if(key === "data" && value !== null)
			{
				if(syncBlockAndValidJson)
					value = _this.dataArrayToFormattedJson(value);
				else if(hashBlock)
					value = _this.dataArrayToHexString(value);
				else if(value.length > _this.textBlockInlineViewThreshold)
					value = <i>see block data preview</i>;
				else
					value = _this.dataArrayToFormattedText(value);

				value = <div className="data-container">{value}</div>;
			}

			if(key === "data" && value === null)
				return;

			if(key === "data_hash")
				value = <a href={router.buildUrl("search", {q: "data_hash:"+value})}>{value}</a>

			if(key === "timestamp")
				value = misc.timestampToDate(value);

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

		if(data.archive === true || block_type === "text")
		{
			const html =
			(
				<tr key="download">
					<td className={"download metric"}>Download:</td>
					<td className={"download value"}>
						<a href={api.apiUrlFromRelativePath("/api/file-download/"+data.block_id)}>Download</a>
						{" "}
						<a href={api.apiUrlFromRelativePath("/api/file-inline/"+data.block_id)} target="_blank">Open in New Window</a>
					</td>
					<td className="empty" />
				</tr>
			);
			tableRows.push(html);
		}

		if(syncBlockAndValidJson)
		{
			const json = JSON.parse(this.dataArrayToString(data.data));
			if(json.chain && json.tx_hash)
			{
				const link = htmlHelpers.renderTransactionViewLink(json.chain, json.tx_hash);
				const html =
				(
					<tr key="view">
						<td className={"view metric"}>View:</td>
						<td className={"view value"}>
							{link}
						</td>
						<td className="empty" />
					</tr>
				);
				tableRows.push(html);
			}
		}

		return htmlHelpers.renderContainerWithTable(containerClassName, containerTitle, tableRows);
	};

	renderBlockMeta = () =>
	{
		const _this = this;
		const data = _this.data;

		const containerClassName = "block-meta-container";
		const containerTitle = "Block Meta Data";

		if(!this.isDataReady())
			return htmlHelpers.renderLoading();

		if(!this.isDataValid())
			return null;

		if(!this.isBlockMetaAvailable())
			return null;
			// return htmlHelpers.renderContainer(containerClassName, containerTitle, "No meta data is available for this block.");

		const block_type = data.block.type;

		const tableRows = [];
		data.meta = _.sortBy(data.meta, "name");
		data.meta.forEach(function(meta, m)
		{
			const label = meta["name"].replace(/_/g, " ");
			let value = meta["value"];

			if(meta["name"][0] !== "_") // Keys starting with an underscore should be hidden.
			{
				// if(meta["name"] === "content_type")
				// 	value = <a href={router.buildUrl("search", {q: `"meta:content_type:${value}"`})}>{value}</a>;

				if(meta["name"] === "email")
					value = <a href={router.buildUrl("search", {q: `"email:${value}"`})}>{value}</a>;

				else if(meta["name"] === "filename")
					value = <a href={router.buildUrl("search", {q: `"filename:${value}"`})}>{value}</a>;

				else if(meta["name"] === "block_id")
					value = <a href={router.buildUrl("block", {id: value})}>{value}</a>;

				else if((meta["name"] === "filesize" || meta["name"] === "data_size"))
					value = `${filesize(value)} (${parseInt(value).toLocaleString()} bytes)`;

				else if(meta["name"] === "file_path")
					value = htmlHelpers.createSearchPath(value);

				else if(meta["name"] === "monitor_id")
					value = <a href={router.buildUrl("search", {q: `"meta:monitor_id:${value.trim()}"`})}>{value}</a>

				else if(meta["name"] === "data_id")
					value = <a href={router.buildUrl("search", {q: `'meta:data_id:${value.trim()}'`})}>{value}</a>

				else if(block_type === "Email" && (meta["name"] === "from" || meta["name"] === "to" || meta["name"] === "subject"))
					value = <a href={router.buildUrl("search", {q: `"email:${value.trim()}"`})}>{value}</a>

				else if(block_type === "Email" && meta["name"] === "source" && misc.isJson(value))
				{
					const json = JSON.parse(value);
					if(_.has(json, "email"))
						value = <a href={router.buildUrl("search", {q: `"email:${json.email}"`})}>{json.email}</a>;
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
			}
		});

		// Add a single timestamp to the end. Use the first meta data entry for this.
		// const html =
		// (
		// 	<tr key="timestamp">
		// 		<td className="metric">Timestamp:</td>
		// 		<td className="value">{misc.timestampToDate(data.meta[0]["timestamp"])}</td>
		// 		<td className="empty" />
		// 	</tr>
		// );
		// tableRows.push(html);

		return htmlHelpers.renderContainerWithTable(containerClassName, containerTitle, tableRows);
	};

	renderBlockDataPreview = () =>
	{
		const data = this.data;

		const containerClassName = "block-preview-container";
		const containerTitle = "Block Data Preview";

		if(!this.isDataPreviewAvailable())
			return null;

		const block_type = data.block.type.toLowerCase();
		const documentExtensions = this.dataPreviewDocumentExtensions;
		const imageExtensions = this.dataPreviewImageExtensions;
		const movieExtensions = this.dataPreviewMovieExtensions;

		if(block_type === "text")
		{
			const html =
			(
				<div className="text-container">
					{this.dataArrayToFormattedText(data.data.data)}
				</div>
			);
			return htmlHelpers.renderContainer(containerClassName, containerTitle, html);
		}

		const extension = this.filenameExtensionFromBlockMetaData(data.meta);
		let html;

		if(_.includes(imageExtensions, extension))
		{
			// Image has a key because it doesn't always seem to refresh properly.
			const src = api.apiUrlFromRelativePath("/api/file-inline/"+data.block.id);
			const expanded = (this.expandDataPreviewImage) ? " expanded" : "";
			html =
			(
				<div className={"image-container" + expanded}>
					<img key={data.block.id} src={src} alt="Image Preview" onClick={this.handleBlockDataPreviewImageClick} title="Click to Expand/Collapse" />
				</div>
			);
		}
		else if(_.includes(movieExtensions, extension))
		{
			// Video has a key because it doesn't always seem to refresh properly.
			const src = api.apiUrlFromRelativePath("/api/file-inline/"+data.block.id);
			html =
			(
				<div className="movie-container">
					<video key={data.block.id} controls>
						<source src={src} />
							Your browser does not support the video tag.
					</video>
				</div>
			);
		}
		else if(_.includes(documentExtensions, extension))
		{
			// Object has a key because it doesn't always seem to refresh properly.
			const src = api.apiUrlFromRelativePath("/api/file-inline/"+data.block.id);
			html =
			(
				<div className="document-container">
					<object key={data.block.id} data={src} />
				</div>
			);
		}
		return htmlHelpers.renderContainer(containerClassName, containerTitle, html);
	};

	renderBlockTags = () =>
	{
		const containerClassName = "block-tags-container";
		const containerTitle = "Block Tags";

		if(!this.isBlockTagsAvailable())
			return null;

		let tags;
		if(!this.tagsEditModeEnabled && this.data.tags.length > 0)
		{
			tags = [];

			const data = _.sortBy(this.data.tags, "name");
			data.forEach(function(tag, t)
			{
				const html =
				(
					<span key={t} className="tag" style={{background: "#"+tag.color, color: "#"+misc.calculateContrastColor(tag.color)}}>
						{tag.name}
					</span>
				);
				tags.push(html);
			});
		}
		else if(!this.tagsEditModeEnabled)
		{
			tags = "No tags have been added to this block.";
		}
		else
		{
			const selectStyles = reactSelect.generateSelectStyles();
			const selectOptions = this.generateTagSelectOptions(this.data.tagsAvailable, false);
			tags = <Select className="react-select" classNamePrefix="react-select" options={selectOptions} styles={selectStyles} value={mobx.toJS(this.selectedTags)} onChange={this.updateSelectedTags} isMulti placeholder="Select Tags..." />;
		}

		const editButton = (!this.tagsEditModeEnabled) ? <button type="button" className="edit-button flat" onClick={this.handleEditTagsClick}>Edit</button> : null;
		const saveCancelButtons = (!this.tagsEditModeEnabled) ? null :
		(
			<div className="edit-save-button-container">
				<button type="button" className="cancel-button flat" onClick={this.handleEditTagsCancel}>Cancel</button>
				<button type="button" className="save-button flat" onClick={this.handleEditTagsSave}>Save</button>
			</div>
		);

		const html =
		(
			<div className="tags-container">
				{editButton}
				{saveCancelButtons}
				{tags}
				{htmlHelpers.clear()}
			</div>
		);
		return htmlHelpers.renderContainer(containerClassName, containerTitle, html);
	};

	renderBlockVerify = () =>
	{
		if(!this.isDataValid())
			return null;

		const results =
		{
			valid: <span className="success"><a href="#verify" onClick={this.verifyBlock}>Success</a></span>,
			invalid: <span className="failure"><a href="#verify" onClick={this.verifyBlock}>Failed</a></span>,
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
		let refreshButton = null;

		if(this.isDataReady() && this.isDataValid())
		{
			const disablePrevBlock = (this.data.block.id === 1);
			const disableNextBlock = (this.data.block.id === this.data.block_count);
			prevButton = <button type="button" className="prev-block" data-modifier={-1} onClick={this.handleNextPrevButtonClick} disabled={disablePrevBlock} title="Previous Block"><i className="fas fa-angle-left"></i></button>;
			nextButton = <button type="button" className="next-block" data-modifier={1} onClick={this.handleNextPrevButtonClick} disabled={disableNextBlock} title="Next Block"><i className="fas fa-angle-right"></i></button>;
			refreshButton = <button type="button" className="refresh" onClick={this.refreshClicked} title="Refresh"><i className="fas fa-sync-alt"></i></button>;
		}

		const html =
		(
			<div className="controls">
				{prevButton}
				{nextButton}
				{refreshButton}
			</div>
		);
		return html;
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
			const newData = _.merge(mobx.toJS(_this.data), {block: {verified: data}});
			_this.updateData(newData);
		})
		.catch(function(error)
		{
			_this.refreshDataFailure(error);
		});
	};

	render()
	{
		const blockTitle = this.renderTitle();
		const block = this.renderBlock();
		const blockData = this.renderBlockData();
		const blockMeta = this.renderBlockMeta();
		const blockTags = this.renderBlockTags();
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
					{blockTags}
					{blockPreview}
				</div>

				<Footer />
			</section>
		);
		return html;
	}
}

export default Component;
