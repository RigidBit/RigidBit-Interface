const config =
{
	apiCacheExpiration: 60, // In minutes.
	blocksRefreshInterval: 5 * 60 * 1000,
	dataPreviewImageExtensions: ["png", "jpg", "jpeg", "gif", "svg"],
	dataPreviewMovieExtensions: ["mov", "mp4", "m4v", "webm", "mkv", "flv", "ogv", "ogg", "avi", "wmv", "qt", "mpg", "mpeg"],
	dashboardStatusRefreshInterval: 5 * 60 * 1000,
	debouceDelayDefault: 200,
	debouceDelayLong: 400,
	debouceDelayShort: 100,
	footerResizeTimerInterval: 500,
	maximumSearchDataLength: 140,
	minimumSearchPhraseLength: 3,
	monitorRefreshInterval: 5 * 60 * 1000,
	navigationDefaultBlocksParams: {count: 10, offset: 0},
	navigationDefaultMonitorParams: {count: 10, offset: 0},
	navigationDefaultSyncParams: {count: 10, offset: 0},
	subnavigationDefaultParamsMonitor: {subsection: "emails", count: 10, offset: 0},
	subnavigationDefaultParamsSettings: {subsection: "users"},
	subnavigationDefaultParamsVerify: {subsection: "chain"},
	syncRefreshInterval: 5 * 60 * 1000,
	verifyRefreshInterval: 1 * 1000,
};

// The following are loaded through the /api/variables endpoint.
// loginPasswordSalt
// settingsEventsEventRuleActionActions
// settingsEventsEventRuleConditionObjects
// settingsEventsEventRuleConditionOperators
// settingsEventsEventRuleRuleTypes

export default config;
