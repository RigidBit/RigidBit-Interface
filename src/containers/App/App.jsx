import Block from "../Block/Block.jsx";
import Blocks from "../Blocks/Blocks.jsx";
import Dashboard from "../Dashboard/Dashboard.jsx";
import Login from "../Login/Login.jsx";
import Settings from "../Settings/Settings.jsx";
import Upload from "../Upload/Upload.jsx";

@observer class App extends React.Component
{
	render()
	{
		let html;
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
			case "settings":
				html = <Settings />;
				break;
			case "upload":
				html = <Upload />;
				break;
			default:
				html = "Invalid route";
		}
		return html;
	}
}

export default App;
