import * as htmlHelpers from "../../common/js/html.jsx";

import Footer from "../../components/Footer/Footer.jsx";
import Header from "../../components/Header/Header.jsx";
import Navigation from "../../components/Navigation/Navigation.jsx";
import SearchResult from "../../containers/Search/SearchResult.jsx";

@observer class Component extends React.Component
{
	@observable data = {};
	@observable searchPhrase = "";
	autorun = null;

	constructor(props)
	{
		super(props);

		this.search = React.createRef();
	}

	componentDidMount()
	{
		this.autorun = mobx.reaction(()=>this.searchPhrase, ()=>
		{
			if(this.searchPhrase.length >= config.minimumSearchPhraseLength)
				this.refreshData();
			else
				this.data = {};
		});

		if("q" in store.routeParams && store.routeParams.q.length > 0)
			action(()=> { this.searchPhrase = store.routeParams.q; })();

		this.search.current.focus();
	}

	componentWillUnmount()
	{
		if(this.autorun)
			this.autorun();
	}

	_handleSearchChange = _.debounce((phrase) =>
	{
		log.debug("SEARCH phrase:", phrase);

		const params = (phrase.length > 0) ? {q: phrase} : {};
		router.replaceHistoryState("search", params);

		action(() => { this.searchPhrase = phrase; })();
	}, config.debouceDelayLong);
	handleSearchChange = (e) =>
	{
		this._handleSearchChange(this.search.current.value);
	};

	_refreshData = (useCache=false) =>
	{
		const _this = this;

		if(store.route !== "search")
			return false;

		if(this.searchPhrase == "")
			return;

		api.getUrl(`/api/search/${this.searchPhrase}?mode=or`, false, true)
		.then(function(data)
		{
			const newData = _.merge(mobx.toJS(_this.data), {searchResults: null}, {searchResults: data});
			action(()=> { _this.data = newData; })();
		})
		.catch(function(error)
		{
			_this.refreshDataFailure(error);
		});
	};
	refreshData = _.debounce(this._refreshData, config.debouceDelayLong);

	refreshDataFailure = (error) =>
	{
		action(()=> { this.data = {searchResults: null}; })();

		log.error(error);
		iziToast.error({title: "Error", message: error});
	};

	renderSearch = () =>
	{
		const containerClassName = "search-container";
		const containerTitle = "Search";

		const html =
		(
			<div>
				<div className="search">
					<input ref={this.search} type="text" name="search" defaultValue={this.searchPhrase} placeholder="Begin typing to search..." onChange={this.handleSearchChange} />
				</div>
				{this.renderSearchResults()}
			</div>
		);

		return htmlHelpers.renderContainer(containerClassName, containerTitle, html);
	};

	renderSearchResults = () =>
	{
		let results = null;
		if(_.isArray(mobx.toJS(this.data.searchResults)))
		{
			const searchPhrase = this.searchPhrase;
			const searchResults = this.data.searchResults;

			if(searchResults.length > 0)
			{
				results = [];

				const html =
				(
					<div key="count" className="count">
						{searchResults.length} result{((searchResults.length === 1) ? "" : "s")} found.
					</div>
				);
				results.push(html);

				searchResults.forEach(function(item, i)
				{
					const html = <SearchResult key={i} data={mobx.toJS(item)} search={searchPhrase} />
					results.push(html);
				});
			}
			else
				results = <div className="no-results">No blocks matched your search.</div>;
		}

		const html =
		(
			<div className="search-results">
				{results}
			</div>
		);
		return html;
	}

	render()
	{
		const search = this.renderSearch();

		const html =
		(
			<section className="search">
				<Header />
				<Navigation />

				<div className="content">
					<h1>
						Search Blocks
						{
							// <div className="controls">
							// 	<button type="button" className="refresh" onClick={this.refreshClicked} title="Refresh"><i className="fas fa-sync-alt"></i></button>
							// </div>
						}
					</h1>
					{search}
				</div>

				<Footer />
			</section>
		);
		return html;
	}
}

export default Component;
