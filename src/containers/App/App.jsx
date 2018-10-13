import Block from "../Block/Block.jsx";
import Blocks from "../Blocks/Blocks.jsx";
import Dashboard from "../Dashboard/Dashboard.jsx";
import Login from "../Login/Login.jsx";
import Save from "../Save/Save.jsx";

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
			case "save":
				html = <Save />;
				break;
			default:
				html = "Invalid route";
		}
		return html;
	}
}

export default App;
