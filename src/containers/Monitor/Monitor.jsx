import filesize from "filesize";
import iziToast from "izitoast";

import * as api from "../../common/js/api.js";
import * as misc from "../../common/js/misc.js";
import * as htmlHelpers from "../../common/js/html.jsx";

import Footer from "../../components/Footer/Footer.jsx";
import Header from "../../components/Header/Header.jsx";
import MonitorData from "./MonitorData.jsx";
import MonitorEmails from "./MonitorEmails.jsx";
import MonitorFiles from "./MonitorFiles.jsx";
import MonitorSync from "./MonitorSync.jsx";
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
			case "data":
				html = <MonitorData refreshSubscribe={this.refreshSubscribe} />;
				break;
			case "emails":
				html = <MonitorEmails refreshSubscribe={this.refreshSubscribe} />;
				break;
			case "files":
				html = <MonitorFiles refreshSubscribe={this.refreshSubscribe} />;
				break;
			case "sync":
				html = <MonitorSync refreshSubscribe={this.refreshSubscribe} />;
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
			{ name: "data", label: "Data", route: "monitor.subsection", routeParams:{subsection: "data", count: 10, offset: 0} },
			{ name: "emails", label: "Emails", route: "monitor.subsection", routeParams:{subsection: "emails", count: 10, offset: 0} },
			{ name: "files", label: "Files", route: "monitor.subsection", routeParams:{subsection: "files", count: 10, offset: 0} },
			{ name: "sync", label: "Sync", route: "monitor.subsection", routeParams:{subsection: "sync", count: 10, offset: 0} },
		];

		const subsection = this.renderSubsection(selectedName);

		// The control hiding is hard coded as a quick workaround.
		// Checking this.refreshHandlers isn't possible since subscription occurs after rendering.
		// const showControls = (_.includes(["tags", "users", "api-keys", "events"], selectedName)) ? "show" : "";
		const showControls = "show";

		const html =
		(
			<section className="monitor">
				<Header />
				<Navigation />
				<div className="content">
					<h1>
						Monitor
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
