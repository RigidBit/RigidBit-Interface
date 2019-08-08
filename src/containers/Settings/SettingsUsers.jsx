import iziToast from "izitoast";
import PropTypes from "prop-types";

import * as confirm from "../../components/Confirm/confirm.js";
import * as htmlHelpers from "../../common/js/html.jsx";
import * as misc from "../../common/js/misc.js";
import {SettingsAddEditUserModal} from "./SettingsUserModals.jsx";
import Table from "../../components/Table/Table.jsx";

@observer class Component extends React.Component
{
	@observable data = {};
	@observable addEditUserModalOpen = false;
	@observable addEditUserModalEditData = null;

	componentDidMount()
	{
		this.props.refreshSubscribe("users", this.refreshData, true);
		this.refreshData();
	}

	componentWillUnmount()
	{
		this.props.refreshSubscribe("users", this.refreshData, false);
	}

	handleAddUserClick = (e) =>
	{
		if(e) e.preventDefault();
		action(()=>{this.addEditUserModalOpen = true;})();
	};

	handleAddEditUserCancelled = () =>
	{
		action(()=>
		{
			this.addEditUserModalOpen = false;
			this.addEditUserModalEditData = null;
		})();
	};

	handleAddUserConfirmed = (data) =>
	{
		const _this = this;

		// Hash password before transmitting, but only if it was provided.
		if(data.password.length > 0)
			data.password = misc.hashPassword(data.password);

		action(()=>{this.addEditUserModalOpen = false;})();

		// Fix types.
		data.is_admin = data.is_admin === "1";
		data.is_disabled = data.is_disabled === "1";

		api.postUrlJson("/api/users", data)
		.then(function(data)
		{
			api.removeCache("/api/users"); // Remove here since this is the only point of change, which allows other pages to used cached responses.
			_this.refreshData();
		})
		.catch(function(error)
		{
			_this.refreshDataFailure(error);
			_this.refreshData();
		});
	};

	handleDeleteUserClick = (e) =>
	{
		if(e) e.preventDefault();

		const data = _.keyBy(mobx.toJS(this.data.users), "id");
		const id = e.currentTarget.dataset.id;
		const user = data[id];

		confirm.show(`Are you sure you want to delete user #${user.id} "${user.username}"?`, ()=>{this.handleDeleteUserConfirmed(user)});
	};

	handleDeleteUserConfirmed = (data) =>
	{
		const _this = this;
		const id = data.id;

		api.deleteUrl("/api/users/"+id)
		.then(function(data)
		{
			api.removeCache("/api/users"); // Remove here since this is the only point of change, which allows other pages to used cached responses.
			_this.refreshData();
		})
		.catch(function(error)
		{
			_this.refreshDataFailure(error);
			_this.refreshData();
		});
	};

	handleEditUserClick = (e) =>
	{
		if(e) e.preventDefault();

		const data = _.keyBy(mobx.toJS(this.data.users), "id");
		const id = e.currentTarget.dataset.id;
		const editData = mobx.toJS(data[id]);

		action(()=>
		{
			this.addEditUserModalOpen = true;
			this.addEditUserModalEditData = editData;
		})();
	};

	handleEditUserConfirmed = (data) =>
	{
		const _this = this;

		// Hash password before transmitting, but only if it was provided.
		if(data.password.length > 0)
			data.password = misc.hashPassword(data.password);

		action(()=>
		{
			this.addEditUserModalOpen = false;
			this.addEditUserModalEditData = null;
		})();

		// Fix types.
		data.is_admin = data.is_admin === "1";
		data.is_disabled = data.is_disabled === "1";

		api.patchUrlJson("/api/users/"+data.id, data)
		.then(function(data)
		{
			api.removeCache("/api/users"); // Remove here since this is the only point of change, which allows other pages to used cached responses.
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
		return (this.data.hasOwnProperty("users"));
	};

	refreshData = () =>
	{
		const _this = this;

		if(!store.route.startsWith("settings"))
			return false;

		api.getUrl("/api/users")
		.then(function(data)
		{
			data = _.sortBy(data, (o)=>o.username.toLowerCase());
			const newData = _.merge(mobx.toJS(_this.data), {users: null}, {users: data});
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

	renderUsersRowActions = (id) =>
	{
		const html =
		(
			<div className="actions">
				<a href="#edit" data-id={id} onClick={this.handleEditUserClick}><i className="far fa-edit"></i></a>
				<a href="#delete" data-id={id} onClick={this.handleDeleteUserClick}><i className="far fa-trash-alt"></i></a>
			</div>
		);
		return html;
	};

	renderAddEditModal = () =>
	{
		if(!this.addEditUserModalOpen)
			return null;

		const editData = mobx.toJS(this.addEditUserModalEditData);
		const isEditMode = _.isObject(editData);

		const html =
		(
			<SettingsAddEditUserModal
				onCancel={this.handleAddEditUserCancelled}
				onConfirm={(!isEditMode) ? this.handleAddUserConfirmed : this.handleEditUserConfirmed}
				editData={editData}
			/>
		);
		return html;
	};

	renderUsers = () =>
	{
		if(!this.isDataReady())
			return htmlHelpers.renderLoading();

		const data = mobx.toJS(this.data.users);

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
			},
			{
				Header: "Admin",
				id: "admin",
				accessor: (d)=>d.is_admin.toString(),
				className: "admin",
				headerClassName: "admin",
				maxWidth: 80,
			},
			{
				Header: "Disabled",
				id: "disabled",
				accessor: (d)=>d.is_disabled.toString(),
				className: "disabled",
				headerClassName: "disabled",
				maxWidth: 80,
			},
			{
				Header: "Mode",
				id: "mode",
				accessor: (d)=>misc.camelCaseToWords(d.mode),
				className: "mode",
				headerClassName: "mode",
				maxWidth: 120,
			},
			{
				Header: "Actions",
				id: "actions",
				accessor: (d)=>this.renderUsersRowActions(d.id),
				className: "actions",
				headerClassName: "actions",
				maxWidth: 80,
				sortable: false,
			}
		];

		const title = 
		(
			<div>
				Users
				<div className="controls">
					<button type="button" onClick={this.handleAddUserClick} title="Add User"><i className="fas fa-plus"></i></button>
				</div>
			</div>
		);

		if(data.length === 0)
			return htmlHelpers.renderContainer("users-container", title, <div className="empty">No users have been created.</div>);
		else
			return htmlHelpers.renderContainer("users-container", title, <Table data={data} columns={columns} />);
	};

	updateData = action((data) =>
	{
		this.data = data;
		log.debug("UPDATE DATA:", this.data);
	});

	render()
	{
		const users = this.renderUsers();
		const addEditUserModal = this.renderAddEditModal();

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
