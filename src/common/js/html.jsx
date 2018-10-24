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

export function renderContainerWithTable(containerClassName, title, tableRows)
{
	return this.renderContainer(containerClassName, title, this.renderTableWithRows(tableRows));
}

export function renderTableWithRows(tableRows, key=null)
{
	const html =
	(
		<table key={key} className="reverse-row-colors">
			<tbody>
				{tableRows}
			</tbody>
		</table>
	);

	return html;
}

export function renderLoading()
{
	return <div className="loading-text">Loading...</div>;
}
