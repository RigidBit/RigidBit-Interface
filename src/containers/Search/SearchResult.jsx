import PropTypes from "prop-types";

import * as htmlHelpers from "../../common/js/html.jsx";
import * as misc from "../../common/js/misc.js";

const REGEX_ESCAPE = /[-[\]{}()*+?.,\\^$|#\s]/g;
const REGEX_PREFIXES = /^(?:data\:|filename\:|file_path\:|hash\:|tag\:)/gi;
const REGEX_TERMS = /('.*?'|".*?"|\S+)/g;
const REGEX_TRIM = /^['"]+|['"]+$/g;

@observer class Component extends React.Component
{
	@observable expandPreviewImage = false;

	handleImageClick = action((e) =>
	{
		if(e && e.preventDefault)
			e.preventDefault();

		this.expandPreviewImage = !this.expandPreviewImage;
	})

	/**
	 * Returns React elements for the specified input string (haystack), highlighting the needles (search terms).
	 *
	 * Since a search phrase may constitute multiple terms, it splits them and processes them in sequence.
	 * Once a match is found, it stops processing further terms. 
	 */
	highlightSearches(haystack, needle)
	{
		let slices = haystack;

		const needles = this.phraseToTerms(needle);
		for(let n = 0; n < needles.length; ++n)
		{
			const needle = this.processNeedle(needles[n]);

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
		const needles = this.phraseToTerms(needle);
		for(let n = 0; n < needles.length; ++n)
		{
			const needle = this.processNeedle(needles[n]);

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
		needles = this.phraseToTerms(needles);

		for(let n = 0; n < needles.length; ++n)
		{
			const needle = this.processNeedle(needles[n]);

			if(needle.length < config.minimumSearchPhraseLength)
				continue;

			const index = haystack.indexOf(needle);

			if(index !== -1)
				return index;
		}

		return -1;
	}

	phraseToTerms(phrase)
	{
		let terms;
		terms = phrase.match(REGEX_TERMS);
		terms = terms.map(function(term)
		{
			return term.replace(REGEX_TRIM, "");
		});

		return terms;
	}

	processNeedle(needle)
	{
		return needle.replace(REGEX_PREFIXES, "").replace(REGEX_ESCAPE, '\\$&');
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

	renderFilePathRow = (m, key, label, value, search) =>
	{
		const item = this.findItemContainingKey(value, "name", "file_path");
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
		const block_type = data.block.block_type.toLowerCase();

		const metrics =
		[
			["id", "ID/Type/Timestamp", data.block],
			["hash", "Block Hash", data.block.hash],
			["filename", "Filename", data.meta],
			["file_path", "File Path", data.meta],
			["text", "Text", data.data],
			["tags", "Tags", data.tags],
			["image-preview", "Preview", data],
			["view-on-etherscan", "View", data]
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
				row = <tr key={m} className={key}><td className="name">{label}:</td><td className="value"><a href={"/#/block/"+value.id}>{value.id}</a> ({value.block_type}) <div className="timestamp">{misc.timestampToDate(value.timestamp)}</div></td><td className="empty"></td></tr>;

			else if(key === "block_type" || key === "block_time")
				row = <tr key={m} className={key}><td className="name">{label}:</td><td className="value">{value}</td><td className="empty"></td></tr>;

			else if(key === "filename")
			{
				const item = _this.findItemContainingKey(value, "name", key);
				if(item && (block_type === "file" || block_type === "filehash" || _this.areTermsPresent(item.value, search)))
				{
					row = _this.renderFilenameRow(m, key, label, value, search);
				}
			}

			else if(key === "file_path")
			{
				const item = _this.findItemContainingKey(value, "name", key);
				if(item && (block_type === "file" || block_type === "filehash" || _this.areTermsPresent(item.value, search)))
				{
					row = _this.renderFilePathRow(m, key, label, value, search);
				}
			}

			else if(key === "hash")
			{
				if(_this.areTermsPresent(value, search))
					row = <tr key={m} className={key}><td className="name">{label}:</td><td className="value">{_this.highlightSearches(value, search)}</td><td className="empty"></td></tr>;
			}

			else if(key === "image-preview")
			{
				if(block_type === "file")
				{
					const item = _this.findItemContainingKey(value.meta, "name", "filename");
					if(item && _.includes(config.dataPreviewImageExtensions, misc.filenameExtension(item.value).toLowerCase()))
					{
						const className = (_this.expandPreviewImage) ? "preview-image expanded" : "preview-image";
						const image = <img key={value.block.id} className={className} src={api.apiUrlFromRelativePath(`/api/file-inline/${value.block.id}`)} alt="Image Preview" title="Click to expand/collapse." onClick={_this.handleImageClick} />;
						row = <tr key={m} className={key}><td className="name">{label}:</td><td className="value">{image}</td><td className="empty"></td></tr>;
					}
				}
			}

			else if(key === "text")
			{
				if(_.has(value, "data") && block_type === "text")
				{
					const text = misc.uintToString(value.data);
					let location = _this.indexOfFirstTerm(text, search) - Math.round(config.maximumSearchDataLength / 4);
					if(location < 0) location = 0;
					const highlightedText = _this.highlightSearches(misc.uintToString(value.data).substr(location, config.maximumSearchDataLength), search);
					row = <tr key={m} className={key}><td className="name">{label}:</td><td className="value text"><div>{highlightedText}</div></td><td className="empty"></td></tr>;
				}
			}

			else if(key === "tags")
			{
				if(_this.areTermsPresent(value.map((o)=>o.name).join(" "), search))
				{
					row = _this.renderTagRow(m, key, label, value, search);
				}
			}

			else if(key === "view-on-etherscan")
			{
				if(block_type === "sync" && misc.isJson(misc.uintToString(value.data.data)))
				{
					const json = JSON.parse(misc.uintToString(value.data.data));
					const link = <a href={`https://etherscan.io/tx/0x${json.tx_hash}`} target="_blank">View on Etherscan</a>;
					row = <tr key={m} className={key}><td className="name">{label}:</td><td className="value">{link}</td><td className="empty"></td></tr>;
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
