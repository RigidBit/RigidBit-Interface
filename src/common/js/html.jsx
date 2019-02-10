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