import * as alert from "../../components/Alert/alert.js";
import * as misc from "../../common/js/misc.js";

class Login extends React.Component
{
	componentDidMount()
	{
		this.logout();
	}

	logout = () =>
	{
		const _this = this;

		api.getUrl("/api/logout")
		.catch(function(error)
		{
			log.error(error);
			alert.show(error);
		});
	};

	render()
	{
		const html =
		(
			<section className="logout">
				<div className="logo">
					<img src={misc.rigidBitLogo()} alt="RigidBit Logo" />
				</div>
				<div className="message">
					You have been logged out.
				</div>
				<div className="link">
					<a href={"#" + router.buildPath("login")}>Return to Login</a>
				</div>
			</section>
		);
		return html;
	}
}

export default Login;
