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
			const needle = needles[n].replace(/^(?:data\:|filename\:|hash\:|tag\:)/gi, "");

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

	/**
	 * Determins if the specified input string (haystack) contains any needles (search terms).
	 */
	areTermsPresent(haystack, needle)
	{
		const needles = needle.split(/\s+/);
		for(let n = 0; n < needles.length; ++n)
		{
			const needle = needles[n].replace(/^(?:filename\:|hash\:|tag\:)/gi, "");

			if(needle.length < config.minimumSearchPhraseLength)
				continue;

			const re = new RegExp(`(${needle})`, "gi");
			const result = re.test(String(haystack));

			if(result)
				return true;
		}

		return false;
	}

	findItemContainingKey = (items, key, value) =>
	{
		if(_.isArray(items))
		{
			for(let i = 0; i < items.length; ++i)
			{
				if(_.isObject(items[i]) && _.has(items[i], key) && items[i][key] === value)
				{
					return items[i];
				}
			}
		}

		return null;
	};

	indexOfFirstTerm = (haystack, needles) =>
	{
		haystack = haystack.toLowerCase();
		needles = needles.split(/\s+/);

		for(let n = 0; n < needles.length; ++n)
		{
			const needle = needles[n].replace(/^(?:data\:|filename\:|hash\:|tag\:)/gi, "");

			if(needle.length < config.minimumSearchPhraseLength)
				continue;

			const index = haystack.indexOf(needle);

			if(index !== -1)
				return index;
		}

		return -1;
	}

	renderFilenameRow = (m, key, label, value, search) =>
	{
		const item = this.findItemContainingKey(value, "name", "filename");
		if(item)
		{
			return <tr key={m} className={key}><td className="name">{label}:</td><td className="value">{this.highlightSearches(item.value, search)}</td><td className="empty"></td></tr>;
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
					const className = (_this.areTermsPresent(tag.name, search)) ? "tag active" : "tag inactive";

					const html =
					(
						<span key={t} className={className} style={{background: "#"+tag.color, color: "#"+misc.calculateContrastColor(tag.color)}}>
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
			["text", "Text", data.data],
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
			{
				const item = _this.findItemContainingKey(value, "name", key);
				if(item && (data.block.block_type.toLowerCase() === "file" || _this.areTermsPresent(item.value, search)))
				{
					row = _this.renderFilenameRow(m, key, label, value, search);
				}
			}

			else if(key === "hash")
			{
				if(_this.areTermsPresent(value, search))
					row = <tr key={m} className={key}><td className="name">{label}:</td><td className="value">{_this.highlightSearches(value, search)}</td><td className="empty"></td></tr>;
			}

			else if(key === "text")
			{
				if(_.has(value, "data") && data.block.block_type.toLowerCase() === "text")
				{
					const text = misc.uintToString(value.data);
					let location = _this.indexOfFirstTerm(text, search) - Math.round(config.maximumSearchDataLength / 4);
					if(location < 0) location = 0;
					const highlightedText = _this.highlightSearches(misc.uintToString(value.data).substr(location, config.maximumSearchDataLength), search);
					row = <tr key={m} className={key}><td className="name">{label}:</td><td className="value text"><div>{highlightedText}{location}</div></td><td className="empty"></td></tr>;
				}
			}

			else if(key === "tags")
			{
				if(_this.areTermsPresent(value.map((o)=>o.name).join(" "), search))
				{
					row = _this.renderTagRow(m, key, label, value, search);
				}
			}

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
