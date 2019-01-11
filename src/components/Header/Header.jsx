import * as misc from "../../common/js/misc.js";

class Component extends React.Component
{
	render()
	{
		const logoutLink = <a href={"#" + router.buildPath("logout")}>Logout</a>;

		const html =
		(
			<header className="main">
				<div className="logo">
					<a href="/">
						<img src={misc.rigidBitLogo()} alt="RigidBit Logo" />
					</a>
				</div>
				<div className="top-menu">
					{logoutLink}
				</div>
			</header>
		);
		return html;
	}
}

export default Component;
