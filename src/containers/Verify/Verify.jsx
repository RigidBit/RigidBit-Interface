import Chain from "./VerifyChain.jsx";
import File from "./VerifyFile.jsx";
import Footer from "../../components/Footer/Footer.jsx";
import Header from "../../components/Header/Header.jsx";
import Navigation from "../../components/Navigation/Navigation.jsx";
import Subnavigation from "../../components/Subnavigation/Subnavigation.jsx";

@observer class Component extends React.Component
{
	refreshHandlers = {};

	refreshClicked = (e) =>
	{
		if(e) e.preventDefault();

		const _this = this;

		_.keys(this.refreshHandlers).forEach(function(key)
		{
			_this.refreshHandlers[key](e);
		});
	};

	refreshSubscribe = (key, handler, subscribe) =>
	{
		if(subscribe)
			this.refreshHandlers[key] = handler;
		else
			delete this.refreshHandlers[key];
	};

	renderSubsection = (subsection) =>
	{
		let html = "";

		switch(subsection)
		{
			case "chain":
				html = <Chain refreshSubscribe={this.refreshSubscribe} />;
				break;
			case "file":
				html = <File refreshSubscribe={this.refreshSubscribe} />;
				break;
			default:
				html = `Invalid subsection: "${subsection}"`;
		}

		return html;
	};

	render()
	{
		const selectedName = mobx.toJS(store.routeParams.subsection);
		const subnavigationItems =
		[
			{ name: "chain", label: "Chain", route: "verify.subsection", routeParams:{subsection: "chain"} },
			{ name: "file", label: "File", route: "verify.subsection", routeParams:{subsection: "file"} },
		];
		const subsection = this.renderSubsection(selectedName);

		// The control hiding is hard coded as a quick workaround.
		// Checking this.refreshHandlers isn't possible since subscription occurs after rendering.
		const showControls = (_.includes(["chain"], selectedName)) ? "show" : "";

		const html =
		(
			<section className="verify">
				<Header />
				<Navigation />

				<div className="content">
					<h1>
						Verify
						<Subnavigation items={subnavigationItems} selectedName={selectedName} />
						<div className={"controls "+showControls}>
							<button type="button" className="refresh" onClick={this.refreshClicked} title="Refresh"><i className="fas fa-sync-alt"></i></button>
						</div>
					</h1>
					{subsection}
				</div>

				<Footer />
			</section>
		);
		return html;
	}
}

export default Component;
