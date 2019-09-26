import iziToast from "izitoast";

import * as htmlHelpers from "../../common/js/html.jsx";

import Footer from "../../components/Footer/Footer.jsx";
import Header from "../../components/Header/Header.jsx";
import Navigation from "../../components/Navigation/Navigation.jsx";
import SearchResult from "../../containers/Search/SearchResult.jsx";

@observer class Component extends React.Component
{
	@observable data = {};
	@observable searchPhrase = "";
	@observable variables = {};
	autorun = [];

	constructor(props)
	{
		super(props);

		this.search = React.createRef();
	}

	componentDidMount()
	{
		const reaction1 = mobx.reaction(()=>store.routeParams, ()=>
		{
			this.handleRouteParamChange();
		});
		this.autorun.push(reaction1);

		const reaction2 = mobx.reaction(()=>this.searchPhrase, ()=>
		{
			this.data = {}; // Clear to prevent immediate rendering of old data.

			if(this.searchPhrase.length >= config.minimumSearchPhraseLength)
			{
				this.refreshData();
			}
		});
		this.autorun.push(reaction2);

		this.refreshDataVariables();
		this.handleRouteParamChange();

		this.search.current.focus();
	    this.search.current.addEventListener("keydown", this.handleSearchKeyPress, false);
	}

	componentWillUnmount()
	{
		this.autorun.forEach(function(autorun)
		{
			autorun();
		});

	    this.search.current.removeEventListener("keydown", this.handleSearchKeyPress, false);
	}

	handleClearSearchClicked = action(() =>
	{
		router.replaceHistoryState("search", {});
		this.searchPhrase = "";
		this.search.current.value = "";
	});

	handleRouteParamChange = action(() =>
	{
		if("q" in store.routeParams && store.routeParams.q.length > 0)
		{
			const query = store.routeParams.q;
			this.searchPhrase = query;
			this.search.current.value = query;
		}
	});

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
	handleSearchKeyPress = (e) =>
	{
		if(this.search.current && this.search.current === e.currentTarget && e.keyCode === 27)
		{
			this.search.current.value = "";
		}
	};

	isDataReady = () =>
	{
		return (this.variables.hasOwnProperty("savedSearches"));
	};

	refreshClicked = (e) =>
	{
		this.refreshData(false);
		this.refreshDataVariables(false);
	};

	_refreshData = (useCache=false) =>
	{
		const _this = this;

		if(store.route !== "search")
			return false;

		if(this.searchPhrase == "")
			return;

		api.getUrl(`/api/search/${encodeURIComponent(this.searchPhrase)}`, false, false, true)
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

	refreshDataVariables = (useCache=false) =>
	{
		const _this = this;

		if(!store.route.startsWith("search"))
			return false;

		api.getUrl("/api/program_data/front_end_ui/saved_search")
		.then(function(data)
		{
			data = _.map(data, (x)=>{x.value=JSON.parse(x.value); return x;});
			const newData = _.merge(mobx.toJS(_this.variables), {savedSearches: null}, {savedSearches: data});
			_this.updateDataVariables(newData);
		})
		.catch(function(error)
		{
			_this.refreshDataFailure(error);
		});
	};

	refreshDataFailure = (error) =>
	{
		action(()=> { this.data = {searchResults: null}; })();

		log.error(error);
		iziToast.error({title: "Error", message: error});
	};

	renderSavedSearches = () =>
	{
		if(!this.isDataReady() || this.variables.savedSearches.length == 0)
			return null;

		let buttons = [];
		for(let search of this.variables.savedSearches)
		{
			const button = <a className="button" href={router.buildUrl("search", {q: search.value.search})}>{search.value.label}</a>;
			buttons.push(button);
		}

		const html =
		(
			<div className="saved-search-container">
				{buttons}
			</div>
		);

		return html;
	};

	renderSearch = () =>
	{
		const containerClassName = "search-container";
		const containerTitle = "Search";
		const clearClassName = (this.searchPhrase.length > 0) ? "clear visible" : "clear";
		const savedSearches = (this.searchPhrase.length == 0) ? this.renderSavedSearches() : null;

		const html =
		(
			<div>
				<div className="search">
					<input ref={this.search} type="text" name="search" placeholder="Begin typing to search..." onChange={this.handleSearchChange} />
					<button className={clearClassName}  onClick={this.handleClearSearchClicked}><i className="far fa-times-circle"></i></button>
				</div>
				{this.renderSearchResults()}
				{savedSearches}
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

	updateDataVariables = action((data) =>
	{
		this.variables = data;
		log.debug("UPDATE DATA VARIABLES:", this.variables);
	});

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
						<div className="controls">
							<button type="button" className="refresh" onClick={this.refreshClicked} title="Refresh"><i className="fas fa-sync-alt"></i></button>
						</div>
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
