import iziToast from "izitoast";

import * as htmlHelpers from "../../common/js/html.jsx";

import * as alert from "../../components/Alert/alert.js";
import * as confirm from "../../components/Confirm/confirm.js";
import Footer from "../../components/Footer/Footer.jsx";
import Header from "../../components/Header/Header.jsx";
import {openAddTagModal, openEditTagModal, openDeleteTagModal} from "./SettingsTagModals.jsx";
import Navigation from "../../components/Navigation/Navigation.jsx";
import Table from "../../components/Table/Table.jsx";

@observer class Component extends React.Component
{
	@observable data = {};
	autorun = null;

	constructor(props)
	{
		super(props);

		this.timestampForm = React.createRef();
	}

	componentDidMount()
	{
		this.refreshData();
	}

	handleClearCacheButtonClick = (e) =>
	{
		localStorage.clear();
		iziToast.success({title: "Success", message: "Cache has been cleared."});
	};

	handleAddTagClick = (e) =>
	{
		e.preventDefault();
		openAddTagModal(this.handleAddTagConfirmed);
	};

	handleAddTagConfirmed = (data) =>
	{
		const _this = this;

		api.postUrl("/api/tags", data, false)
		.then(function(data)
		{
			_this.removeCache("/api/tags"); // Remove here since this is the only point of change, which allows other pages to used cached responses.
			_this.refreshData();
		})
		.catch(function(error)
		{
			_this.refreshDataFailure(error);
			_this.refreshData();
		});
	};

	handleDeleteTagClick = (e) =>
	{
		e.preventDefault();

		const data = _.keyBy(mobx.toJS(this.data.tags), "id");
		const id = e.currentTarget.dataset.id;

		openDeleteTagModal(data[id], this.handleDeleteTagConfirmed);
	};

	handleDeleteTagConfirmed = (data) =>
	{
		const _this = this;
		const id = data.id;

		api.deleteUrl("/api/tags/"+id, false)
		.then(function(data)
		{
			_this.refreshData();
		})
		.catch(function(error)
		{
			_this.refreshDataFailure(error);
			_this.refreshData();
		});
	};

	handleEditTagClick = (e) =>
	{
		e.preventDefault();

		const data = _.keyBy(mobx.toJS(this.data.tags), "id");
		const id = e.currentTarget.dataset.id;

		openEditTagModal(data[id], this.handleEditTagConfirmed);
	};

	handleEditTagConfirmed = (data) =>
	{
		const _this = this;

		api.patchUrl("/api/tags/"+data.id, data, false)
		.then(function(data)
		{
			_this.refreshData();
		})
		.catch(function(error)
		{
			_this.refreshDataFailure(error);
			_this.refreshData();
		});
	};

	handleTagNameClick = (e) =>
	{
		e.preventDefault();

		const q = "tag:" + e.currentTarget.dataset.name;
		router.navigate("search", {q})
	};

	handleTimestampSubmitButtonClick = (e) =>
	{
		if(e)
			e.preventDefault();

		api.postUrl("/api/timestamp", null, false)
		.then(function(data)
		{
			iziToast.success({title: "Success", message: "Timestamp has been created."});
		})
		.catch(function(error)
		{
			log.error(error);
			iziToast.error({title: "Error", message: error});
		});
	};

	isDataReady = () =>
	{
		return (this.data.hasOwnProperty("tags"));
	};

	updateData = action((data) =>
	{
		this.data = data;
		log.debug("UPDATE DATA:", this.data);
	});

	refreshClicked = (e) =>
	{
		e.preventDefault();

		this.refreshData();
	};

	refreshData = () =>
	{
		const _this = this;

		if(store.route !== "settings")
			return false;

		api.getUrl("/api/tags-with-usage", false)
		.then(function(data)
		{
			const newData = _.merge(mobx.toJS(_this.data), {tags: null}, {tags: data});
			_this.updateData(newData);
		})
		.catch(function(error)
		{
			_this.refreshDataFailure(error);
		});
	};

	refreshDataFailure = (error) =>
	{
		this.updateData({});

		log.error(error);
		iziToast.error({title: "Error", message: error});
	};

	renderCache = () =>
	{
		if(!this.isDataReady())
			return htmlHelpers.renderLoading();

		const html =
		(
			<div>
				<div className="description">
					Clear all local storage caches. During normal operation caches are pruned automatically. However, manual purges may be necessary if you operate more than one RigidBit backend simultaneously on the same host address.
				</div>
				<div className="button-container">
					<button type="button" className="clear-cache" onClick={this.handleClearCacheButtonClick} title="Clear Cache"><i className="far fa-trash-alt icon"></i>Clear Cache</button>
				</div>
			</div>
		);
		return htmlHelpers.renderContainer("cache-container", "Clear Cache", html);
	};

	renderTags = () =>
	{
		if(!this.isDataReady())
			return htmlHelpers.renderLoading();

		const data = mobx.toJS(this.data.tags);

		const columns =
		[
			{
				Header: "ID",
				accessor: "id",
				className: "id",
				headerClassName: "id",
				maxWidth: 50,
			},
			{
				Header: "Name",
				id: "name",
				accessor: (d)=>this.renderTagsName(d.name),
				className: "name",
				headerClassName: "name",
			},
			{
				Header: "Color",
				id: "color",
				accessor: (d)=>this.renderTagsColorPreview("#"+d.color),
				className: "color",
				headerClassName: "color",
				maxWidth: 100,
				sortMethod: (a, b) => parseInt(a.props.children[1].replace("#", ""), 16) - parseInt(b.props.children[1].replace("#", ""), 16),
			},
			{
				Header: "Hidden",
				id: "hidden",
				accessor: (d)=>d.hidden.toString(),
				className: "hidden",
				headerClassName: "hidden",
				maxWidth: 80,
			},
			{
				Header: "Uses",
				accessor: "uses",
				className: "uses",
				headerClassName: "uses",
				maxWidth: 60,
			},
			{
				Header: "Actions",
				id: "actions",
				accessor: (d)=>this.renderTagsRowActions(d.id),
				className: "actions",
				headerClassName: "actions",
				maxWidth: 80,
				sortable: false,
			}
		];

		const title = 
		(
			<div>
				Tags
				<div className="controls">
					<button type="button" onClick={this.handleAddTagClick} title="Add Tag"><i className="fas fa-plus"></i></button>
				</div>
			</div>
		);
		return htmlHelpers.renderContainer("tags-container", title, <Table data={data} columns={columns} />);
	};

	renderTagsColorPreview = (color) =>
	{
		const html =
		(
			<div className="color-preview">
				<span className="color-preview" style={{"background": color}} />
				{color}
			</div>
		);
		return html;
	};

	renderTagsName = (name) =>
	{
		const html =
		(
			<a href={"/#/search?q=tag%3A"+name} data-name={name} onClick={this.handleTagNameClick}>{name}</a>
		);
		return html;
	};

	renderTagsRowActions = (id) =>
	{
		const html =
		(
			<div className="actions">
				<a href="#edit" data-id={id} onClick={this.handleEditTagClick}><i className="far fa-edit"></i></a>
				<a href="#delete" data-id={id} onClick={this.handleDeleteTagClick}><i className="far fa-trash-alt"></i></a>
			</div>
		);
		return html;
	};

	renderTimestamp = () =>
	{
		if(!this.isDataReady())
			return htmlHelpers.renderLoading();

		const html =
		(
			<div>
				<div className="description">
					Create a manual timestamp entry in the blockchain.
				</div>
				<form ref={this.timestampForm} action="/api/timestamp" method="post" encType="multipart/form-data" onSubmit={this.handleFormSubmit}>
					<div className="button-container">
						<button type="button" className="submit" onClick={this.handleTimestampSubmitButtonClick} title="Create Timestamp"><i className="far fa-save icon"></i>Create Timestamp</button>
					</div>
				</form>
			</div>
		);
		return htmlHelpers.renderContainer("timestamp-container", "Timestamp", html);
	};

	render()
	{
		const tags = this.renderTags();
		const timestamp = this.renderTimestamp();
		const cache = this.renderCache();

		const html =
		(
			<section className="settings">
				<Header />
				<Navigation />

				<div className="content">
					<h1>
						Settings
						<div className="controls">
							<button type="button" className="refresh" onClick={this.refreshClicked} title="Refresh"><i className="fas fa-sync-alt"></i></button>
						</div>
					</h1>
					{tags}
					{timestamp}
					{cache}
				</div>

				<Footer />
			</section>
		);
		return html;
	}
}

export default Component;
