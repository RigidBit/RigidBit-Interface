import iziToast from "izitoast";
import PropTypes from "prop-types";

import * as confirm from "../../components/Confirm/confirm.js";
import * as htmlHelpers from "../../common/js/html.jsx";
import * as misc from "../../common/js/misc.js";
import {SettingsAddEditEventRuleModal} from "./SettingsEventsModals.jsx";
import Table from "../../components/Table/Table.jsx";

@observer class Component extends React.Component
{
	@observable data = {};
	@observable addEditEventRuleModalOpen = false;
	@observable addEditEventRuleModalEditData = null;

	componentDidMount()
	{
		this.props.refreshSubscribe("events", this.refreshData, true);
		this.refreshData();
	}

	componentWillUnmount()
	{
		this.props.refreshSubscribe("events", this.refreshData, false);
	}

	// Fix form value data that has ended up as the wrong type. Forms are always strings. Int, bool, and null are not supported.
	fixEventRuleCompleteTypes = (data) =>
	{
		if(_.has(data.rule, "id")) delete(data.rule.id);
		data.rule.is_disabled = parseBool(data.rule.is_disabled);

		for(let c in data.conditions)
		{
			if(_.has(data.conditions[c], "id")) delete(data.conditions[c].id);
			data.conditions[c].value_int = (data.conditions[c].value_int === "") ? null : parseInt(data.conditions[c].value_int);
			if(data.conditions[c].value_string === "") data.conditions[c].value_string =  null;
			data.conditions[c].is_disabled = parseBool(data.conditions[c].is_disabled);
		}

		for(let a in data.actions)
		{
			if(_.has(data.actions[a], "id")) delete(data.actions[a].id);
			data.actions[a].value_int = (data.actions[a].value_int === "") ? null : parseInt(data.actions[a].value_int);
			if(data.actions[a].value_string === "") data.actions[a].value_string =  null;
			data.actions[a].is_disabled = parseBool(data.actions[a].is_disabled);
		}

		return data;
	};

	handleAddEventRuleClick = (e) =>
	{
		if(e) e.preventDefault();
		action(()=>{this.addEditEventRuleModalOpen = true;})();
	};

	handleAddEditEventRuleCancelled = () =>
	{
		action(()=>
		{
			this.addEditEventRuleModalOpen = false;
			this.addEditEventRuleModalEditData = null;
		})();
	};

	handleAddEventRuleConfirmed = (data) =>
	{
		const _this = this;

		action(()=>{this.addEditEventRuleModalOpen = false;})();

		data = this.fixEventRuleCompleteTypes(data);

		api.postUrlJson("/api/event-rules-complete", data)
		.then(function(data)
		{
			api.removeCache("/api/event-rules-complete"); // Remove here since this is the only point of change, which allows other pages to used cached responses.
			_this.refreshData();
		})
		.catch(function(error)
		{
			_this.refreshDataFailure(error);
			_this.refreshData();
		});
	};

	handleDeleteEventRuleClick = (e) =>
	{
		if(e) e.preventDefault();

		const data = _.keyBy(mobx.toJS(this.data.eventRules), "rule.id");
		const id = e.currentTarget.dataset.id;
		const eventRule = data[id];

		confirm.show(`Are you sure you want to delete event rule #${eventRule.rule.id} "${eventRule.rule.name}"?`, ()=>{this.handleDeleteEventRuleConfirmed(eventRule)});
	};

	handleDeleteEventRuleConfirmed = (data) =>
	{
		const _this = this;
		const id = data.rule.id;

		api.deleteUrl("/api/event-rules/"+id)
		.then(function(data)
		{
			api.removeCache("/api/event-rules-complete"); // Remove here since this is the only point of change, which allows other pages to used cached responses.
			_this.refreshData();
		})
		.catch(function(error)
		{
			_this.refreshDataFailure(error);
			_this.refreshData();
		});
	};

	handleEditEventRuleClick = (e) =>
	{
		if(e) e.preventDefault();

		const data = _.keyBy(mobx.toJS(this.data.eventRules), "rule.id");
		const id = e.currentTarget.dataset.id;
		const editData = mobx.toJS(data[id]);

		action(()=>
		{
			this.addEditEventRuleModalOpen = true;
			this.addEditEventRuleModalEditData = editData;
		})();
	};

	handleEditEventRuleConfirmed = (data) =>
	{
		const _this = this;

		action(()=>
		{
			this.addEditEventRuleModalOpen = false;
			this.addEditEventRuleModalEditData = null;
		})();

		const id = data.rule.id;
		data = this.fixEventRuleCompleteTypes(data);

		api.patchUrlJson("/api/event-rules-complete/"+id, data)
		.then(function(data)
		{
			api.removeCache("/api/event-rules-complete"); // Remove here since this is the only point of change, which allows other pages to used cached responses.
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
		return (this.data.hasOwnProperty("eventRules") && this.data.hasOwnProperty("tags"));
	};

	refreshData = () =>
	{
		const _this = this;

		if(!store.route.startsWith("settings"))
			return false;

		api.getUrl("/api/event-rules-complete")
		.then(function(data)
		{
			data = _.sortBy(data, (o)=>o.rule.name.toLowerCase());
			const newData = _.merge(mobx.toJS(_this.data), {eventRules: null}, {eventRules: data});
			_this.updateData(newData);
		})
		.then(()=>api.getUrl("/api/tags"))
		.then(function(data)
		{
			data = _.sortBy(data, (o)=>o.name.toLowerCase());
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

	renderEventRulesRowActions = (id) =>
	{
		const html =
		(
			<div className="actions">
				<a href="#edit" data-id={id} onClick={this.handleEditEventRuleClick}><i className="far fa-edit"></i></a>
				<a href="#delete" data-id={id} onClick={this.handleDeleteEventRuleClick}><i className="far fa-trash-alt"></i></a>
			</div>
		);
		return html;
	};

	renderAddEditEventRuleModal = () =>
	{
		if(!this.addEditEventRuleModalOpen)
			return null;

		const isEditMode = _.isObject(mobx.toJS(this.addEditEventRuleModalEditData));

		const html =
		(
			<SettingsAddEditEventRuleModal
				onCancel={this.handleAddEditEventRuleCancelled}
				onConfirm={(!isEditMode) ? this.handleAddEventRuleConfirmed : this.handleEditEventRuleConfirmed}
				editData={mobx.toJS(this.addEditEventRuleModalEditData)}
				tagData={mobx.toJS(this.data.tags).filter((o)=>o.is_hidden==false)}
			/>
		);
		return html;
	};

	renderEventRules = () =>
	{
		if(!this.isDataReady())
			return htmlHelpers.renderLoading();

		let data = mobx.toJS(this.data.eventRules);
		data = _.sortBy(data, (o)=>o.rule.name.toLowerCase());

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
				accessor: "rule.name",
				className: "name",
				headerClassName: "name",
			},
			{
				Header: "Type",
				id: "type",
				accessor: (d)=>misc.camelCaseToWords(d.rule.type),
				className: "type",
				headerClassName: "type",
				maxWidth: 160,
			},
			{
				Header: "C / A",
				id: "c_a",
				accessor: (d)=>`${d.conditions.length} / ${d.actions.length}`,
				className: "c_a",
				headerClassName: "c_a",
				maxWidth: 70,
			},
			{
				Header: "Disabled",
				id: "is_disabled",
				accessor: (d)=>d.rule.is_disabled.toString(),
				className: "is_disabled",
				headerClassName: "is_disabled",
				maxWidth: 80,
			},
			{
				Header: "Actions",
				id: "actions",
				accessor: (d)=>this.renderEventRulesRowActions(d.rule.id),
				className: "actions",
				headerClassName: "actions",
				maxWidth: 80,
				sortable: false,
			}
		];

		const title = 
		(
			<div>
				Event Rules
				<div className="controls">
					<button type="button" onClick={this.handleAddEventRuleClick} title="Add User"><i className="fas fa-plus"></i></button>
				</div>
			</div>
		);

		if(data.length === 0)
			return htmlHelpers.renderContainer("events-container", title, <div className="empty">No event rules have been created.</div>);
		else
			return htmlHelpers.renderContainer("events-container", title, <Table data={data} columns={columns} />);
	};

	updateData = action((data) =>
	{
		this.data = data;
		log.debug("UPDATE DATA:", this.data);
	});

	render()
	{
		const eventRules = this.renderEventRules();
		const addEditEventRuleModal = this.renderAddEditEventRuleModal();

		const html =
		(
			<div>
				{eventRules}
				{addEditEventRuleModal}
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
