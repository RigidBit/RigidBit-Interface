class Component extends React.Component
{
	handleClick(e)
	{
		e.preventDefault();

		const route = e.currentTarget.href.split("#")[1];

		let params = null;
		if (route === "blocks") params = config.navigationDefaultBlocksParams;
		else if (route === "monitor") params = config.navigationDefaultMonitorParams;

		router.navigate(route, params);
	}

	render()
	{
		const _this = this;
		const activeLink = "#" + store.route;

		const linkData =
		[
			["#dashboard", "Dashboard"],
			[["#blocks", "#block"], "Blocks"],
			["#monitor", "Monitor"],
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

		const html =
		(
			<nav className="main">
				<ul>
					{links}
				</ul>
			</nav>
		);
		return html;
	}
}

export default Component;
