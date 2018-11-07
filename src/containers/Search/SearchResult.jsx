import PropTypes from "prop-types";

import * as htmlHelpers from "../../common/js/html.jsx";
import * as misc from "../../common/js/misc.js";

class Component extends React.PureComponent
{
	/**
	 * Returns React elements for the specified input string (haystack), highlighting the needles (search terms).
	 *
	 * Since a search phrase may constitute multiple terms, it splits them by \s+ and processes them in sequence.
	 * Once a match is found, it stops processing further terms. 
	 */
	highlightSearches(haystack, needle)
	{
		let slices = haystack;

		const needles = needle.split(/\s+/);
		for(let n = 0; n < needles.length; ++n)
		{
			const needle = needles[n].replace(/^(?:filename\:|tag\:)/gi, "");

			if(needle.length < config.minimumSearchPhraseLength)
				continue;

			const re = new RegExp(`(${needle})`, "gi");
			slices = String(haystack).split(re);

			if(slices.length === 1)
			{
				slices = haystack;
				continue;
			}

			for(let i = 1; i < slices.length; i += 2)
			{
				slices[i] = <span key={i} className="highlight">{slices[i]}</span>;
			}

			break;
		}

		return <span>{slices}</span>;
	}

	renderFilenameRow = (m, key, label, value, search) =>
	{
		if(_.isArray(value))
		{
			for(let i = 0; i < value.length; ++i)
			{
				if(value[i].name === key)
				{
					return <tr key={m} className={key}><td className="name">{label}:</td><td className="value">{this.highlightSearches(value[i].value, search)}</td><td className="empty"></td></tr>;
				}
			}
		}

		return null;
	};

	renderTagRow = (m, key, label, value, search) =>
	{
		const _this = this;

		if(_.isArray(value))
		{
			if(value.length > 0)
			{
				const tags = [];
				value.forEach(function(tag, t)
				{
					const html =
					(
						<span key={t} className="tag" style={{background: "#"+tag.color, color: "#"+misc.calculateContrastColor(tag.color)}}>
							{_this.highlightSearches(tag.name, search)}
						</span>
					);
					tags.push(html);
				});
				return <tr key={m} className={key}><td className="name">{label}:</td><td className="value">{tags}</td><td className="empty"></td></tr>;
			}
		}

		return null;
	};

	renderTableRows = (data, search) =>
	{
		const _this = this;

		const metrics =
		[
			["id", "Block ID/Type", data.block],
			["hash", "Block Hash", data.block.hash],
			["filename", "Filename", data.meta],
			["tags", "Tags", data.tags],
			// ["block_time", "Block Time", misc.timestampToDate(data.block.timestamp)],
		];

		const rows = [];
		metrics.forEach(function(metric, m)
		{
			const key = metric[0];
			const label = metric[1];
			const value = metric[2];

			let row = null;

			if(key === "id")
				row = <tr key={m} className={key}><td className="name">{label}:</td><td className="value"><a href={"/#/block/"+value.id}>{value.id}</a> ({value.block_type})</td><td className="empty"></td></tr>;

			else if(key === "block_type" || key === "block_time")
				row = <tr key={m} className={key}><td className="name">{label}:</td><td className="value">{value}</td><td className="empty"></td></tr>;

			else if(key === "filename")
				row = _this.renderFilenameRow(m, key, label, value, search);

			else if(key === "tags")
				row = _this.renderTagRow(m, key, label, value, search);

			else
				row = <tr key={m} className={key}><td className="name">{label}:</td><td className="value">{_this.highlightSearches(value, search)}</td><td className="empty"></td></tr>;

			if(row !== null)
				rows.push(row);
		});

		return htmlHelpers.renderTableWithRows(rows);
	};

	render()
	{
		const props = this.props;
		const data = props.data;

		const html =
		(
			<div className={props.className}>
				{this.renderTableRows(data, props.search)}
			</div>
		);
		return html;
	}
}

Component.defaultProps =
{
	className: "search-result",
};

Component.propTypes =
{
	className: PropTypes.string,
	data: PropTypes.object.isRequired,
	search: PropTypes.string.isRequired,
};

export default Component;
