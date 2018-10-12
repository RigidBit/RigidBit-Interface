import Block from "../Block/Block.jsx";
import Blocks from "../Blocks/Blocks.jsx";
import Dashboard from "../Dashboard/Dashboard.jsx";
import File from "../File/File.jsx";
import Login from "../Login/Login.jsx";
import Message from "../Message/Message.jsx";

@observer class App extends React.Component
{
	render()
	{
		let html;
		switch(store.route)
		{
			case "dashboard":
				html = <Dashboard />;
				break;
			case "file":
				html = <File />;
				break;
			case "login":
				html = <Login />;
				break;
			case "message":
				html = <Message />;
				break;
			case "block":
				html = <Block />;
				break;
			case "blocks":
				html = <Blocks />;
				break;
			default:
				html = "Invalid route";
		}
		return html;
	}
}

export default App;
