import iziToast from "izitoast";

import * as alert from "../../components/Alert/alert.js";
import * as misc from "../../common/js/misc.js";
import {ChangePasswordModal} from "./HeaderChangePasswordModals.jsx";

@observer class Component extends React.Component
{
	@observable menuExpanded = false;
	@observable showChangePassword = false;

	constructor(props)
	{
		super(props);

		this.navigation = React.createRef();
	}

	changePasswordCancelled = () =>
	{
		action(()=>{this.showChangePassword = false;})();
	};

	changePasswordConfirmed = (data) =>
	{
		action(()=>{this.showChangePassword = false;})();

		// Hash passwords before transmitting.
		data.old_password = misc.hashPassword(data.old_password);
		data.new_password = misc.hashPassword(data.new_password);

		api.patchUrlJson("/api/password", data)
		.then(function(data)
		{
			alert.show("Your password has been updated.");
		})
		.catch(function(error)
		{
			log.error(error);
			alert.show(error);
		});

	};

	handleClearCacheClicked = (e) =>
	{
		if(e) e.preventDefault();
		if(e) e.stopPropagation();

		action(()=>{this.menuExpanded = false;})();

		api.purgeCache();

		iziToast.success({title: "Success", message: "Cache has been cleared."});
	};

	handleChangePasswordClicked = (e) =>
	{
		if(e) e.preventDefault();
		if(e) e.stopPropagation();

		action(()=>{this.menuExpanded = false;})();
		action(()=>{this.showChangePassword = true;})();
	}

	handleLogoutClicked = (e) =>
	{
		if(e) e.preventDefault();
		if(e) e.stopPropagation();

		action(()=>{this.menuExpanded = false;})();

		router.navigate("logout");
	};

	handleNavigationClicked = (e) =>
	{
		if(e) e.preventDefault();
		if(e) e.stopPropagation();

		action(()=>{this.menuExpanded = !this.menuExpanded;})();
	};

	render()
	{
		const user = mobx.toJS(store.user);
		const isSingleUserMode = (user.id === 0);
		const changePasswordModal = (this.showChangePassword) ? <ChangePasswordModal onCancel={this.changePasswordCancelled} onConfirm={this.changePasswordConfirmed} /> : null;

		const menuClassName = (this.menuExpanded) ? "menu expanded" : "menu";

		let topNavigationClassName = ["top-navigation"];
		if(isSingleUserMode) topNavigationClassName.push("single-user-mode");
		if(this.menuExpanded) topNavigationClassName.push("expanded");
		topNavigationClassName = topNavigationClassName.join(" ");

		const html =
		(
			<header className="main">

				<div className="logo">
					<a href="/">
						<img src={misc.rigidBitLogo()} alt="RigidBit Logo" />
					</a>
				</div>

				<nav ref={this.navigation} className={topNavigationClassName} onClick={this.handleNavigationClicked}>
					<label className="username">{user.username}</label><i className="fas fa-caret-down"></i>
					<ul className={menuClassName}>
						<li><a href="#clearcache" onClick={this.handleClearCacheClicked}><i className="far fa-trash-alt"></i><label>Clear Cache</label></a></li>
						<li className="changepassword"><a href="#changepassword" onClick={this.handleChangePasswordClicked}><i className="fas fa-key"></i><label>Password</label></a></li>
						<li className="logout"><a href={router.buildUrl("logout")} onClick={this.handleLogoutClicked}><i className="fas fa-sign-out-alt"></i><label>Log Out</label></a></li>
					</ul>
				</nav>

				{changePasswordModal}

			</header>
		);
		return html;
	}
}

export default Component;
