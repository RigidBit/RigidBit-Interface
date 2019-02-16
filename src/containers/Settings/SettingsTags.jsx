import iziToast from "izitoast";
import PropTypes from "prop-types";

import * as htmlHelpers from "../../common/js/html.jsx";

import * as alert from "../../components/Alert/alert.js";
import * as confirm from "../../components/Confirm/confirm.js";
import Footer from "../../components/Footer/Footer.jsx";
import Header from "../../components/Header/Header.jsx";
import {openAddTagModal, openEditTagModal, openDeleteTagModal} from "./SettingsTagModals.jsx";
import Navigation from "../../components/Navigation/Navigation.jsx";
import Subnavigation from "../../components/Subnavigation/Subnavigation.jsx";
import Table from "../../components/Table/Table.jsx";

@observer class Component extends React.Component
{
	@observable data = {};

	componentDidMount()
	{
		this.props.refreshSubscribe("tags", this.refreshData, true);
		this.refreshData();
	}

	componentWillUnmount()
	{
		this.props.refreshSubscribe("tags", this.refreshData, false);
	}

	handleAddTagClick = (e) =>
	{
		if(e) e.preventDefault();
		openAddTagModal(this.handleAddTagConfirmed);
	};

	handleAddTagConfirmed = (data) =>
	{
		const _this = this;

		api.postUrl("/api/tags", data, false)
		.then(function(data)
		{
			api.removeCache("/api/tags"); // Remove here since this is the only point of change, which allows other pages to used cached responses.
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
		if(e) e.preventDefault();

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
			api.removeCache("/api/tags"); // Remove here since this is the only point of change, which allows other pages to used cached responses.
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
		if(e) e.preventDefault();

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
			api.removeCache("/api/tags"); // Remove here since this is the only point of change, which allows other pages to used cached responses.
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
		if(e) e.preventDefault();

		const q = "tag:" + e.currentTarget.dataset.name;
		router.navigate("search", {q})
	};

	isDataReady = () =>
	{
		return (this.data.hasOwnProperty("tags"));
	};

	refreshData = () =>
	{
		const _this = this;

		if(!store.route.startsWith("settings"))
			return false;

		api.getUrl("/api/tags-with-usage", false)
		.then(function(data)
		{
			data = _.sortBy(data, (o)=>o.name);
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

	renderTags = () =>
	{
		if(!this.isDataReady())
			return htmlHelpers.renderLoading();

		const data = mobx.toJS(this.data.tags);

		const columns =
		[
			// {
			// 	Header: "ID",
			// 	accessor: "id",
			// 	className: "id",
			// 	headerClassName: "id",
			// 	maxWidth: 50,
			// },
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
				accessor: (d)=>d.is_hidden.toString(),
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

		if(data.length === 0)
			return htmlHelpers.renderContainer("tags-container", title, <div className="empty">No tags have been created.</div>);
		else
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

	updateData = action((data) =>
	{
		this.data = data;
		log.debug("UPDATE DATA:", this.data);
	});

	render()
	{
		return this.renderTags();
	}
}

Component.defaultProps =
{
};

Component.propTypes =
{
	refreshSubscribe: PropTypes.func,
};

export default Component;
