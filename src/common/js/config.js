const config =
{
	apiCacheExpiration: 60, // In minutes.
	blocksRefreshInterval: 5 * 60 * 1000,
	dashboardStatusRefreshInterval: 5 * 60 * 1000,
	debouceDelayDefault: 200,
	debouceDelayLong: 400,
	debouceDelayShort: 100,
	footerResizeTimerInterval: 500,
	maximumSearchDataLength: 140,
	minimumSearchPhraseLength: 3,
	monitorRefreshInterval: 5 * 60 * 1000,
	navigationDefaultBlocksParams: {count: 10, offset: 0, type: "user"},
	navigationDefaultMonitorParams: {count: 10, offset: 0},
};

export default config;