import * as misc from "../../common/js/misc.js";

class Component extends React.Component
{
	render()
	{
		const html =
		(
			<header className="main">
				<div className="logo">
					<a href="/">
						<img src={misc.rigidBitLogo()} alt="RigidBit Logo" />
					</a>
				</div>
				<div className="top-menu">
					John Doe
				</div>
			</header>
		);
		return html;
	}
}

export default Component;
