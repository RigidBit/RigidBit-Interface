import * as alert from "../../components/Alert/alert.js"; 
import * as misc from "../../common/js/misc.js";

@observer class Component extends React.Component
{
	@observable menuExpanded = false;

	constructor(props)
	{
		super(props);

		this.navigation = React.createRef();
	}

	handleClearCacheClicked = (e) =>
	{
		if(e) e.preventDefault();
		if(e) e.stopPropagation();

		action(()=>{this.menuExpanded = false;})();

		api.purgeCache();

		alert.show("All caches have been cleared.");
	};

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
						<li className="logout"><a href={router.buildUrl("logout")} onClick={this.handleLogoutClicked}><i className="fas fa-sign-out-alt"></i><label>Log Out</label></a></li>
					</ul>
				</nav>

			</header>
		);
		return html;
	}
}

export default Component;
