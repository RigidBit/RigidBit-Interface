import iziToast from "izitoast";

import * as misc from "../../common/js/misc.js";

import Block from "../Block/Block.jsx";
import Blocks from "../Blocks/Blocks.jsx";
import Dashboard from "../Dashboard/Dashboard.jsx";
import Login from "../Login/Login.jsx";
import Logout from "../Logout/Logout.jsx";
import Monitor from "../Monitor/Monitor.jsx";
import Search from "../Search/Search.jsx";
import Settings from "../Settings/Settings.jsx";
import Sync from "../Sync/Sync.jsx";
import Upload from "../Upload/Upload.jsx";

@observer class App extends React.Component
{
	@observable isReady = false;

	componentDidMount()
	{
		this.refreshData();
	}

	refreshData = () =>
	{
		const _this = this;

		api.getUrl("/api/variables", true)
		.then(function(data)
		{
			misc.mapApiVariablesToConfig(data);

			api.getUrl("/api/login-check")
			.then(function(data)
			{
				action(() =>
				{
					store.user = data;
					_this.isReady = true;
				})();
			})
			.catch(function(error)
			{
				router.navigate("login", _this.determineRedirect());
				action(() => { _this.isReady = true; })(); // Must occur after router.navigate().
			});
		})
		.catch(function(error)
		{
			log.error(String(error));
			iziToast.error({title: "Error", message: String(error)});
		});
	};

	determineRedirect = () =>
	{
		const data = mobx.toJS(store);

		if(data.route != "login")
		{
			const redirect = JSON.stringify({route:data.route, routeParams:data.routeParams});
			return {redirect};
		}
		else
			return {};
	};

	render()
	{
		let html = "";

		if(!this.isReady)
			return html;

		switch(store.route)
		{
			case "block":
				html = <Block />;
				break;
			case "blocks":
				html = <Blocks />;
				break;
			case "dashboard":
				html = <Dashboard />;
				break;
			case "login":
				html = <Login />;
				break;
			case "logout":
				html = <Logout />;
				break;
			case "monitor":
			case "monitor.subsection":
				html = <Monitor />;
				break;
			case "settings":
			case "settings.subsection":
				html = <Settings />;
				break;
			case "sync":
				html = <Sync />;
				break;
			case "upload":
				html = <Upload />;
				break;
			case "search":
				html = <Search />;
				break;
			default:
				html = `Invalid route: "${store.route}"`;
		}

		return html;
	}
}

export default App;
