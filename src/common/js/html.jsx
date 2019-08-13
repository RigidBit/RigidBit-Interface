import * as misc from "./misc.js";

/**
 * Convert a path string into a React element with clickable path componets. 
 * 
 * @param  {String} fullpath The path to be converted.
 * @return {Object}          A React element with clickable path components.
 */
export function createSearchPath(fullpath)
{
	const isWindowsPath = misc.isWindowsPath(fullpath);
	const isWindowsElp = misc.isWindowsElp(fullpath);
	const processedPath = (isWindowsPath && isWindowsElp) ? misc.stripWindowsElp(fullpath) : fullpath;
	const divider = (isWindowsPath) ? "\\" : "/";

	let paths = processedPath.split(divider).map(function(path, p)
	{
		const leadSlash = (p > 0) ? (isWindowsPath) ? "\\" : "/" : "";

		if(path.length >= config.minimumSearchPhraseLength)
		{
			const link = <a href={"#" + router.buildPath("search", {q: `"file_path:${path}"`})}>{path}</a>;
			return <span key={p}>{leadSlash}{link}</span>;
		}
		else
			return <span key={p}>{leadSlash}{path}</span>;

		return path;
	});

	return paths;
}

export function renderContainer(containerClassName, title, content1=null, content2=null, content3=null)
{
	const html =
	(
		<section className={containerClassName}>
			<h2>{title}</h2>
			{content1}
			{content2}
			{content3}
		</section>
	);

	return html;
}

export function renderContainerWithTable(containerClassName, title, tableRows, tableHeaderRows=null, tableKey=null)
{
	return this.renderContainer(containerClassName, title, this.renderTableWithHeaderAndRows(tableHeaderRows, tableRows, tableKey));
}

export function renderTableWithHeaderAndRows(tableHeaderRows=null, tableRows=null, tableKey=null)
{
	const header = (tableHeaderRows) ? <thead>{tableHeaderRows}</thead> : null;
	const tableClassName = (tableHeaderRows) ? "" : "reverse-row-colors";

	const html =
	(
		<table key={tableKey} className={tableClassName}>
			{header}
			<tbody>
				{tableRows}
			</tbody>
		</table>
	);

	return html;
}

export function renderTableWithRows(tableRows, key=null)
{
	return renderTableWithHeaderAndRows(null, tableRows, key);
}

export function renderLoading()
{
	return <div className="loading-text">Loading...</div>;
}

export function renderTransactionViewLink(chain, tx_hash, linkHtml=null)
{
	let link;
	if(chain === "ethereum")
	{
		const label = (linkHtml) ? linkHtml : "View on Etherscan";
		link = <a href={`https://etherscan.io/tx/0x${tx_hash}`} target="_blank">{label}</a>
	}
	else if(chain === "horizen")
	{
		const label = (linkHtml) ? linkHtml : "View on Horizen Explorer";
		link = <a href={`https://explorer.zensystem.io/tx/${tx_hash}`} target="_blank">{label}</a>
	}
	else if(chain === "rigidbit")
	{
		link = tx_hash;
	}
	else
	{
		log.error(`Invalid chain specified: ${chain}`);
		link = null;
	}

	return link;
};

export function clear()
{
	return <div style={{clear: "both", lineHeight: 0, height: 0}}>&nbsp;</div>;
}