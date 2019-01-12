class Component extends React.Component
{
	handleClick(e)
	{
		e.preventDefault();

		const route = e.currentTarget.href.split("#")[1];

		let params = null;
		if (route === "blocks") params = config.navigationDefaultBlocksParams;
		else if (route === "monitor") params = config.navigationDefaultMonitorParams;
		else if (route === "sync") params = config.navigationDefaultSyncParams;

		router.navigate(route, params);
	}

	render()
	{
		const _this = this;
		const activeLink = "#" + store.route;
		const isAdmin = (store && store.user && store.user.is_admin) ? true : false;

		const linkData =
		[
			["#dashboard", "Dashboard"],
			[["#blocks", "#block"], "Blocks"],
			["#monitor", "Monitor"],
			["#sync", "Sync"],
			["#upload", "Upload"],
			["#settings", "Settings"],
			["#search", <i className="fas fa-search"></i>],
		];

		const links = [];
		linkData.forEach(function(link, i)
		{
			const className = (_.includes(_.castArray(link[0]), activeLink)) ? "active" : "";
			const html = <li key={i} className={className}><a href={_.castArray(link[0])[0]} onClick={_this.handleClick}>{link[1]}</a></li>;
			links.push(html);
		});

		const navClassName = (isAdmin) ? "main admin" : "main";

		const html =
		(
			<nav className={navClassName}>
				<ul>
					{links}
				</ul>
			</nav>
		);
		return html;
	}
}

export default Component;
