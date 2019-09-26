import iziToast from "izitoast";
import PropTypes from "prop-types";

import * as confirm from "../../components/Confirm/confirm.js";
import * as htmlHelpers from "../../common/js/html.jsx";
import * as misc from "../../common/js/misc.js";
import {SettingsAddEditSearchModal} from "./SettingsSearchModals.jsx";
import Table from "../../components/Table/Table.jsx";

@observer class Component extends React.Component
{
	@observable data = {};
	@observable addEditSearchModalOpen = false;
	@observable addEditSearchModalEditData = null;

	componentDidMount()
	{
		this.props.refreshSubscribe("search", this.refreshData, true);
		this.refreshData();
	}

	componentWillUnmount()
	{
		this.props.refreshSubscribe("search", this.refreshData, false);
	}

	handleAddSearchClick = (e) =>
	{
		if(e) e.preventDefault();
		action(()=>{this.addEditSearchModalOpen = true;})();
	};

	handleAddEditSearchCancelled = () =>
	{
		action(()=>
		{
			this.addEditSearchModalOpen = false;
			this.addEditSearchModalEditData = null;
		})();
	};

	handleAddSearchConfirmed = (data) =>
	{
		const _this = this;

		// Reformat data.
		data =
		{
			type: "front_end_ui",
			name: "saved_search",
			value: JSON.stringify(data),
		};

		action(()=>{this.addEditSearchModalOpen = false;})();

		api.postUrlJson("/api/program_data", data)
		.then(function(data)
		{
			api.removeCache("/api/program_data/front_end_ui/saved_search"); // Remove here since this is the only point of change, which allows other pages to used cached responses.
			_this.refreshData();
		})
		.catch(function(error)
		{
			_this.refreshDataFailure(error);
			_this.refreshData();
		});
	};

	handleDeleteSearchClick = (e) =>
	{
		if(e) e.preventDefault();
		const data = _.keyBy(mobx.toJS(this.data.searches), "id");
		const id = e.currentTarget.dataset.id;
		const search = data[id];

		confirm.show(`Are you sure you want to delete search #${id} "${search.value.label}"?`, ()=>{this.handleDeleteSearchConfirmed(search)});
	};

	handleDeleteSearchConfirmed = (data) =>
	{
		const _this = this;
		const id = data.id;

		api.deleteUrl(`/api/program_data/${id}`)
		.then(function(data)
		{
			api.removeCache("/api/program_data/front_end_ui/saved_search"); // Remove here since this is the only point of change, which allows other pages to used cached responses.
			_this.refreshData();
		})
		.catch(function(error)
		{
			_this.refreshDataFailure(error);
			_this.refreshData();
		});
	};

	handleEditSearchClick = (e) =>
	{
		if(e) e.preventDefault();

		const data = _.keyBy(mobx.toJS(this.data.searches), "id");
		const id = e.currentTarget.dataset.id;
		const editData = mobx.toJS(data[id]);

		action(()=>
		{
			this.addEditSearchModalOpen = true;
			this.addEditSearchModalEditData = editData;
		})();
	};

	handleEditSearchConfirmed = (data) =>
	{
		const _this = this;

		// Reformat data.
		const id = data.id;
		delete(data.id);
		data =
		{
			type: "front_end_ui",
			name: "saved_search",
			value: JSON.stringify(data),
		};

		action(()=>
		{
			this.addEditSearchModalOpen = false;
			this.addEditSearchModalEditData = null;
		})();

		api.patchUrlJson(`/api/program_data/${id}`, data)
		.then(function(data)
		{
			api.removeCache("/api/program_data/front_end_ui/saved_search"); // Remove here since this is the only point of change, which allows other pages to used cached responses.
			_this.refreshData();
		})
		.catch(function(error)
		{
			_this.refreshDataFailure(error);
			_this.refreshData();
		});
	};

	isDataReady = () =>
	{
		return (this.data.hasOwnProperty("searches"));
	};

	refreshData = () =>
	{
		const _this = this;

		if(!store.route.startsWith("settings"))
			return false;

		api.getUrl("/api/program_data/front_end_ui/saved_search")
		.then(function(data)
		{
			data = _.sortBy(data, "id");
			data = _.map(data, (x)=>{x.value=JSON.parse(x.value); return x;});
			const newData = _.merge(mobx.toJS(_this.data), {searches: null}, {searches: data});
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

	renderSearchesRowActions = (id) =>
	{
		const html =
		(
			<div className="actions">
				<a href="#edit" data-id={id} onClick={this.handleEditSearchClick}><i className="far fa-edit"></i></a>
				<a href="#delete" data-id={id} onClick={this.handleDeleteSearchClick}><i className="far fa-trash-alt"></i></a>
			</div>
		);
		return html;
	};

	renderAddEditModal = () =>
	{
		if(!this.addEditSearchModalOpen)
			return null;

		const editData = mobx.toJS(this.addEditSearchModalEditData);
		const isEditMode = _.isObject(editData);

		const html =
		(
			<SettingsAddEditSearchModal
				onCancel={this.handleAddEditSearchCancelled}
				onConfirm={(!isEditMode) ? this.handleAddSearchConfirmed : this.handleEditSearchConfirmed}
				editData={editData}
			/>
		);
		return html;
	};

	renderSearches = () =>
	{
		if(!this.isDataReady())
			return htmlHelpers.renderLoading();

		const data = mobx.toJS(this.data.searches);

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
				Header: "Label",
				id: "Label",
				accessor: (d)=>d.value.label,
				className: "label",
				headerClassName: "label",
			},
			{
				Header: "Search",
				id: "search",
				accessor: (d)=><a href={router.buildUrl("search", {q: d.value.search})}>{d.value.search}</a>,
				className: "search",
				headerClassName: "search",
			},
			{
				Header: "Actions",
				id: "actions",
				accessor: (d)=>this.renderSearchesRowActions(d.id),
				className: "actions",
				headerClassName: "actions",
				maxWidth: 80,
				sortable: false,
			}
		];

		const title = 
		(
			<div>
				Saved Searches
				<div className="controls">
					<button type="button" onClick={this.handleAddSearchClick} title="Add Search"><i className="fas fa-plus"></i></button>
				</div>
			</div>
		);

		if(data.length === 0)
			return htmlHelpers.renderContainer("searches-container", title, <div className="empty">No searches have been created.</div>);
		else
			return htmlHelpers.renderContainer("searches-container", title, <Table data={data} columns={columns} />);
	};

	updateData = action((data) =>
	{
		this.data = data;
		log.debug("UPDATE DATA:", this.data);
	});

	render()
	{
		const searches = this.renderSearches();
		const addEditSearchModal = this.renderAddEditModal();

		const html =
		(
			<div>
				{searches}
				{addEditSearchModal}
			</div>
		);
		return html;
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
