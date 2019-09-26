import ApiKeys from "./SettingsApiKeys.jsx";
import Events from "./SettingsEvents.jsx";
import Footer from "../../components/Footer/Footer.jsx";
import Header from "../../components/Header/Header.jsx";
import Misc from "./SettingsMisc.jsx";
import Navigation from "../../components/Navigation/Navigation.jsx";
import Search from "./SettingsSearch.jsx";
import Subnavigation from "../../components/Subnavigation/Subnavigation.jsx";
import Tags from "./SettingsTags.jsx";
import Users from "./SettingsUsers.jsx";

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
			case "users":
				html = <Users refreshSubscribe={this.refreshSubscribe} />;
				break;
			case "api-keys":
				html = <ApiKeys refreshSubscribe={this.refreshSubscribe} />;
				break;
			case "tags":
				html = <Tags refreshSubscribe={this.refreshSubscribe} />;
				break;
			case "events":
				html = <Events refreshSubscribe={this.refreshSubscribe} />;
				break;
			case "search":
				html = <Search refreshSubscribe={this.refreshSubscribe} />;
				break;
			case "misc":
				html = <Misc />;
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
			{ name: "users", label: "Users", route: "settings.subsection", routeParams:{subsection: "users"} },
			{ name: "api-keys", label: "API Keys", route: "settings.subsection", routeParams:{subsection: "api-keys"} },
			{ name: "tags", label: "Tags", route: "settings.subsection", routeParams:{subsection: "tags"} },
			{ name: "events", label: "Events", route: "settings.subsection", routeParams:{subsection: "events"} },
			{ name: "search", label: "Search", route: "settings.subsection", routeParams:{subsection: "search"} },
			{ name: "misc", label: "Misc.", route: "settings.subsection", routeParams:{subsection: "misc"} },
		];
		const subsection = this.renderSubsection(selectedName);

		// The control hiding is hard coded as a quick workaround.
		// Checking this.refreshHandlers isn't possible since subscription occurs after rendering.
		const showControls = (_.includes(["users", "api-keys", "tags", "events", "search"], selectedName)) ? "show" : "";

		const html =
		(
			<section className="settings">
				<Header />
				<Navigation />

				<div className="content">
					<h1>
						Settings
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
