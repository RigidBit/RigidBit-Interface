import iziToast from "izitoast";
import PropTypes from "prop-types";

import * as confirm from "../../components/Confirm/confirm.js";
import * as htmlHelpers from "../../common/js/html.jsx";
import * as misc from "../../common/js/misc.js";
import {SettingsAddApiKeyModal} from "./SettingsApiKeysModals.jsx";
import Table from "../../components/Table/Table.jsx";

@observer class Component extends React.Component
{
	@observable data = {};
	@observable addApiKeyModalOpen = false;

	componentDidMount()
	{
		this.props.refreshSubscribe("api-keys", this.refreshData, true);
		this.refreshData();
	}

	componentWillUnmount()
	{
		this.props.refreshSubscribe("api-keys", this.refreshData, false);
	}

	handleAddApiKeyClick = (e) =>
	{
		if(e) e.preventDefault();
		action(()=>{this.addApiKeyModalOpen = true;})();
	};

	handleAddApiKeyCancelled = () =>
	{
		action(()=>
		{
			this.addApiKeyModalOpen = false;
		})();
	};

	handleAddApiKeyConfirmed = (data) =>
	{
		const _this = this;

		action(()=>{this.addApiKeyModalOpen = false;})();

		api.postUrl("/api/api-keys", data)
		.then(function(data)
		{
			api.removeCache("/api/api-keys"); // Remove here since this is the only point of change, which allows other pages to used cached responses.
			_this.refreshData();
		})
		.catch(function(error)
		{
			_this.refreshDataFailure(error);
			_this.refreshData();
		});
	};

	handleDeleteApiKeyClick = (e) =>
	{
		if(e) e.preventDefault();

		const apiKeys = _.keyBy(mobx.toJS(this.data.apiKeys), "id");
		const users = _.keyBy(mobx.toJS(this.data.users), "id");
		const id = e.currentTarget.dataset.id;
		const apiKey = apiKeys[id];

		confirm.show(`Are you sure you want to delete API key #${apiKey.id} for "${users[apiKey.user_id].username}"?`, ()=>{this.handleDeleteApiKeyConfirmed(apiKey)});
	};

	handleDeleteApiKeyConfirmed = (data) =>
	{
		const _this = this;
		const id = data.id;

		api.deleteUrl("/api/api-keys/"+id)
		.then(function(data)
		{
			api.removeCache("/api/api-keys"); // Remove here since this is the only point of change, which allows other pages to used cached responses.
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
		return (this.data.hasOwnProperty("users") && this.data.hasOwnProperty("apiKeys"));
	};

	refreshData = () =>
	{
		const _this = this;

		if(!store.route.startsWith("settings"))
			return false;

		api.getUrl("/api/users")
		.then(function(data)
		{
			// data = _.sortBy(data, (o)=>o.username);
			const newData = _.merge(mobx.toJS(_this.data), {users: null}, {users: data});
			_this.updateData(newData);
		})
		.then(()=>api.getUrl("/api/api-keys"))
		.then(function(data)
		{
			// data = _.sortBy(data, (o)=>o.username);
			const newData = _.merge(mobx.toJS(_this.data), {apiKeys: null}, {apiKeys: data});
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

	renderApiKeysRowActions = (id) =>
	{
		const html =
		(
			<div className="actions">
				<a href="#delete" data-id={id} onClick={this.handleDeleteApiKeyClick}><i className="far fa-trash-alt"></i></a>
			</div>
		);
		return html;
	};

	renderAddModal = () =>
	{
		if(!this.addApiKeyModalOpen)
			return null;

		const html =
		(
			<SettingsAddApiKeyModal
				data={mobx.toJS(this.data.users)}
				onCancel={this.handleAddApiKeyCancelled}
				onConfirm={this.handleAddApiKeyConfirmed}
			/>
		);
		return html;
	};

	renderApiKeys = () =>
	{
		if(!this.isDataReady())
			return htmlHelpers.renderLoading();

		let data_api_keys = mobx.toJS(this.data.apiKeys);
		let data_users = _.keyBy(mobx.toJS(this.data.users), "id");

		// Add the matching username to data_api_keys from data_users where the user_id matches.
		data_api_keys = data_api_keys.map((o)=>
		{
			return {...o, username: data_users[o.user_id].username};
		});

		// Sort by username then API key.
		data_api_keys = _.orderBy(data_api_keys, ["username", "api_key"]);

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
				Header: "Username",
				id: "username",
				accessor: "username",
				className: "username",
				headerClassName: "username",
				maxWidth: 200,
			},
			{
				Header: "API Key",
				id: "api-key",
				accessor: "api_key",
				className: "api-key",
				headerClassName: "api-key",
			},
			{
				Header: "Actions",
				id: "actions",
				accessor: (d)=>this.renderApiKeysRowActions(d.id),
				className: "actions",
				headerClassName: "actions",
				maxWidth: 80,
				sortable: false,
			}
		];

		const title = 
		(
			<div>
				API Keys
				<div className="controls">
					<button type="button" onClick={this.handleAddApiKeyClick} title="Add API Key"><i className="fas fa-plus"></i></button>
				</div>
			</div>
		);

		if(data_api_keys.length === 0)
			return htmlHelpers.renderContainer("api-keys-container", title, <div className="empty">No API keys have been created.</div>);
		else
			return htmlHelpers.renderContainer("api-keys-container", title, <Table data={data_api_keys} columns={columns} />);
	};

	updateData = action((data) =>
	{
		this.data = data;
		log.debug("UPDATE DATA:", this.data);
	});

	render()
	{
		const users = this.renderApiKeys();
		const addEditUserModal = this.renderAddModal();

		const html =
		(
			<div>
				{users}
				{addEditUserModal}
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
