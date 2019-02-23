import PropTypes from "prop-types";
import ReactModal from 'react-modal';
import Select from 'react-select';
import Table from "../../components/Table/Table.jsx";

import * as misc from "../../common/js/misc.js";

@observer class SettingsAddEditEventRuleModal extends React.Component
{
	@observable modalOpen = true;
	@observable dataActions = [];
	@observable dataConditions = [];
	@observable dataRule = {};

	settingsEventsEventRuleDefaults = {name: "", type: "NewBlock", is_disabled: false};
	settingsEventsEventRuleActionDefaults = {action: "AddTag", value_int: "", value_string: "", is_disabled: false};
	settingsEventsEventRuleConditionDefaults = {object: "Filename", operator: "Equals", value_int: "", value_string: "", is_disabled: false};

	constructor(props)
	{
		super(props);

		this.form = React.createRef();
		this.formConditions = React.createRef();
		this.formActions = React.createRef();

		this.setDataDefaults(props);
	}

	componentDidMount()
	{
	}

	componentWillUnmount()
	{
	}

	getDefaultsForDataType = (dataType) =>
	{
		if(dataType === "dataActions")
		{
			const defaults = _.cloneDeep(this.settingsEventsEventRuleActionDefaults);
			if(_.isArray(this.props.tagData) && this.props.tagData.length > 0) defaults.value_int = this.props.tagData[0].id;
			return defaults;
		}
		else
			return this.settingsEventsEventRuleConditionDefaults;
	};

	handleRequestClose = (e) =>
	{
		this.handleCancelClicked(e);
	};

	handleAddEditClicked = (e) =>
	{
		if(e) e.preventDefault();

		const isEditMode = _.isObject(this.props.editData);

		const data = {};
		data.rule = mobx.toJS(this.dataRule);
		data.actions = mobx.toJS(this.dataActions);
		data.conditions = mobx.toJS(this.dataConditions);

		action(()=>{this.modalOpen = false;})();

		setTimeout(()=>
		{
			this.props.onConfirm(data);
		}, 310);
	};

	handleCancelClicked = (e) =>
	{
		if(e) e.preventDefault();

		action(()=>{this.modalOpen = false;})();

		setTimeout(()=>
		{
			this.props.onCancel();
		}, 310);
	};

	handleActionConditionAddClicked = (e, dataType) =>
	{
		if(e) e.preventDefault();

		let defaults = this.getDefaultsForDataType(dataType);

		action(()=>
		{
			const newItem = defaults;
			newItem.id = this.randomDataId();
			this[dataType].push(newItem);
		})();
	};

	handleActionConditionDeleteClick = (e, dataType) =>
	{
		if(e) e.preventDefault();

		const id = parseInt(e.currentTarget.dataset.id);

		action(()=>
		{
			this[dataType] = mobx.toJS(this[dataType]).filter(function(item)
			{
				return (item.id !== id);
			});
		})();
	};

	handleActionConditionDuplicateClick = (e, dataType) =>
	{
		if(e) e.preventDefault();

		const data = mobx.toJS(this[dataType]);
		const id = parseInt(e.currentTarget.dataset.id);

		action(()=>
		{
			for(let d in data)
			{
				if(data[d].id === id)
				{
					const newItem = _.cloneDeep(data[d]);
					newItem.id = this.randomDataId();
					this[dataType].push(newItem);
					break;
				}
			}
		})();
	};

	handleRuleChanged = (e, dataKey) =>
	{
		const value = e.currentTarget.value;

		action(()=>
		{
			this.dataRule[dataKey] = value;
		})();
	};

	handleActionConditionChanged = (e, dataType, dataKey) =>
	{
		const id = parseInt(e.currentTarget.dataset.id);
		const value = e.currentTarget.value;

		action(()=>
		{
			this[dataType] = mobx.toJS(this[dataType]).map(function(item, i)
			{
				if(item.id === id)
				{
					const newItem = _.cloneDeep(item);
					newItem[dataKey] = value;
					return newItem;
				}

				return item;
			});
		})();
	};

	randomDataId()
	{
		return misc.getRandomInt(Math.pow(10, 6), Math.pow(10, 10));
	}

	renderActionRowActions = (id) =>
	{
		const html =
		(
			<div className="actions">
				<a href="#duplicate" data-id={id} onClick={(e)=>this.handleActionConditionDuplicateClick(e, "dataActions")}><i className="far fa-copy"></i></a>
				<a href="#delete" data-id={id} onClick={(e)=>this.handleActionConditionDeleteClick(e, "dataActions")}><i className="far fa-trash-alt"></i></a>
			</div>
		);
		return html;
	};

	renderConditionRowActions = (id) =>
	{
		const html =
		(
			<div className="actions">
				<a href="#duplicate" data-id={id} onClick={(e)=>this.handleActionConditionDuplicateClick(e, "dataConditions")}><i className="far fa-copy"></i></a>
				<a href="#delete" data-id={id} onClick={(e)=>this.handleActionConditionDeleteClick(e, "dataConditions")}><i className="far fa-trash-alt"></i></a>
			</div>
		);
		return html;
	};

	renderFormActions = () =>
	{
		const data = mobx.toJS(this.dataActions);

		if(data.length === 0)
			return <div className="empty">No actions have been created.</div>;

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
				Header: "Action",
				id: "action",
				accessor: this.renderActionSelect,
				className: "action",
				headerClassName: "action",
			},
			{
				Header: "Value",
				id: "value",
				accessor: this.renderTagSelect,
				className: "value",
				headerClassName: "value",
			},
			{
				Header: "Disabled",
				id: "is_disabled",
				accessor: (o)=>this.renderIsDisabledSelect(o, "dataActions"),
				className: "is_disabled",
				headerClassName: "is_disabled",
				maxWidth: 90,
			},
			{
				Header: "Actions",
				id: "actions",
				accessor: (d)=>this.renderActionRowActions(d.id),
				className: "actions",
				headerClassName: "actions",
				maxWidth: 80,
				sortable: false,
			}
		];

		return <Table className="react-table actions" data={data} columns={columns} />;
	};

	renderFormConditions = () =>
	{
		const data = mobx.toJS(this.dataConditions);

		if(data.length === 0)
			return <div className="empty">No conditions have been created.</div>;

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
				Header: "Object",
				id: "object",
				accessor: this.renderObjectSelect,
				className: "object",
				headerClassName: "object",
			},
			{
				Header: "Operator",
				id: "operator",
				accessor: this.renderOperatorSelect,
				className: "operator",
				headerClassName: "operator",
			},
			{
				Header: "Value",
				id: "value",
				accessor: this.renderValueStringInput,
				className: "value",
				headerClassName: "value",
			},
			{
				Header: "Disabled",
				id: "is_disabled",
				accessor: (o)=>this.renderIsDisabledSelect(o, "dataConditions"),
				className: "is_disabled",
				headerClassName: "is_disabled",
				maxWidth: 90,
			},
			{
				Header: "Actions",
				id: "actions",
				accessor: (d)=>this.renderConditionRowActions(d.id),
				className: "actions",
				headerClassName: "actions",
				maxWidth: 80,
				sortable: false,
			}
		];

		return <Table className="react-table conditions" data={data} columns={columns} />;
	};

	renderFormRule = () =>
	{
		const options = config.settingsEventsEventRuleRuleTypes;

		const html =
		(
			<React.Fragment>
				<label className="name">
					Name
					<input type="text" className="name" value={this.dataRule.name} placeholder="Event Rule Name" minLength="1" maxLength="64" autoComplete="off" required={true} onChange={(e)=>this.handleRuleChanged(e, "name")} />
				</label>
				<label className="type">
					Type
					{this.renderSelect(options, this.dataRule.type, (e)=>this.handleRuleChanged(e, "type"))}
				</label>
				<label className="disabled">
					Disabled
					{this.renderSelect(["false", "true"], this.dataRule.is_disabled, (e)=>this.handleRuleChanged(e, "is_disabled"))}
				</label>
			</React.Fragment>
		);
		return html;
	};

	renderActionSelect = (data) =>
	{
		const options = config.settingsEventsEventRuleActionActions;
		return this.renderSelect(options, data.action, (e)=>this.handleActionConditionChanged(e, "dataActions", "action"), data.id);
	};

	renderIsDisabledSelect = (data, dataType) =>
	{
		const options = ["false", "true"];
		return this.renderSelect(options, data.is_disabled, (e)=>this.handleActionConditionChanged(e, dataType, "is_disabled"), data.id);
	};

	renderObjectSelect = (data) =>
	{
		const options = config.settingsEventsEventRuleConditionObjects;
		return this.renderSelect(options, data.object, (e)=>this.handleActionConditionChanged(e, "dataConditions", "object"), data.id);
	};

	renderOperatorSelect = (data) =>
	{
		const options = config.settingsEventsEventRuleConditionOperators;
		return this.renderSelect(options, data.operator, (e)=>this.handleActionConditionChanged(e, "dataConditions", "operator"), data.id);
	};

	renderSelect = (options, value, onChange, dataId="", className="") =>
	{
		value = String(value);

		const optionsHtml = options.map(function(value, v)
		{
			let optionLabel = value;
			let optionValue = value;

			if(_.isObject(value))
			{
				optionLabel = value.label;
				optionValue = value.value;
			}

			return <option key={v} value={optionValue}>{optionLabel}</option>;
		});

		const html =
		(
			<select className={className} value={value} data-id={dataId} onChange={onChange}>
				{optionsHtml}
			</select>
		);

		return html;
	};

	renderTagSelect = (data) =>
	{
		const options = this.props.tagData.map(function(o)
		{
			return { value: o.id, label: o.name };
		});

		return this.renderSelect(options, data.value_int, (e)=>this.handleActionConditionChanged(e, "dataActions", "value_int"), data.id);
	};

	renderValueStringInput = (data) =>
	{
		const value_string = (data.value_string === null) ? "" : data.value_string;
		return <input type="text" name="value_string" data-id={data.id} value={value_string} onChange={(e)=>this.handleActionConditionChanged(e, "dataConditions", "value_string")} />;
	};

	setDataDefaults = (props) =>
	{
		action(() =>
		{
			const isEditMode = _.isObject(props.editData);
			if(isEditMode)
			{
				this.dataRule = _.cloneDeep(props.editData.rule);
				this.dataActions = _.cloneDeep(props.editData.actions);
				this.dataConditions = _.cloneDeep(props.editData.conditions);
			}
			else
			{
				this.dataRule = this.settingsEventsEventRuleDefaults;
			}
		})();
	};

	render()
	{
		const isEditMode = _.isObject(this.props.editData);

		const confirmButtonTitle = (!isEditMode) ? "Add" : "Save";
		const title = (!isEditMode) ? "Add Event Rule" : "Edit Event Rule";

		const formActions = this.renderFormActions();
		const formConditions = this.renderFormConditions();
		const formRule = this.renderFormRule();

		const html =
		(
			<ReactModal
				isOpen={this.modalOpen}
				onRequestClose={this.handleRequestClose}
				closeTimeoutMS={300}
				contentLabel="Add User Modal"
				className={{base: "ReactModal__Content add-edit-event-rule-modal", afterOpen: "ReactModal__Content--after-open", beforeClose: "ReactModal__Content--before-close"}}
				overlayClassName={{base: "ReactModal__Overlay", afterOpen: "ReactModal__Overlay--after-open", beforeClose: "ReactModal__Overlay--before-close"}}
				portalClassName={"ReactModalPortal"}
				ariaHideApp={false}
				shouldFocusAfterRender={true}
				shouldCloseOnOverlayClick={true}
				shouldCloseOnEsc={true}
				shouldReturnFocusAfterClose={false}
				parentSelector={()=>document.body}
			>
				<div className="content">
					<h1>{title}</h1>

					<form ref={this.form}>
						{formRule}
					</form>

					<h2>
						Conditions
						<div className="controls">
							<button type="button" className="add" onClick={this.handleAddCondition} title="Add Condition" onClick={(e)=>this.handleActionConditionAddClicked(e, "dataConditions")}><i className="fas fa-plus"></i></button>
						</div>

					</h2>

					<form ref={this.formConditions} className="conditions">
						{formConditions}
					</form>

					<h2>
						Actions
						<div className="controls">
							<button type="button" className="add" onClick={this.handleAddAction} title="Add Action" onClick={(e)=>this.handleActionConditionAddClicked(e, "dataActions")}><i className="fas fa-plus"></i></button>
						</div>
					</h2>

					<form ref={this.formActions} className="actions">
						{formActions}
					</form>

				</div>
				<div className="footer">
					<button type="button" className="cancel-button" onClick={this.handleCancelClicked}>Cancel</button>
					<button type="button" className="confirm-button" onClick={this.handleAddEditClicked}>{confirmButtonTitle}</button>
				</div>
			</ReactModal>
		);
		return html;
	}
}

SettingsAddEditEventRuleModal.defaultProps =
{
};

SettingsAddEditEventRuleModal.propTypes =
{
	editData: PropTypes.object,
	onCancel: PropTypes.func,
	onConfirm: PropTypes.func,
	tagData: PropTypes.array,
};

export {SettingsAddEditEventRuleModal};
