import PropTypes from "prop-types";

import * as htmlHelpers from "../../common/js/html.jsx";
import * as misc from "../../common/js/misc.js";

const REGEX_ESCAPE = /[-[\]{}()*+?.,\\^$|#\s]/g;
const REGEX_PREFIXES = /^(?:data\:|data_hash\:|email\:|filename\:|file_path\:|hash\:|meta\:|meta_hash\:|tag\:|type\:)/gi;
const REGEX_TERMS = /('.*?'|".*?"|\S+)/g;
const REGEX_TRIM = /^['"]+|['"]+$/g;

@observer class Component extends React.Component
{
	@observable expandPreviewImage = false;

	createSearchPath = (fullpath, search) =>
	{
		const _this = this;
		const isWindowsPath = misc.isWindowsPath(fullpath);
		const isWindowsElp = misc.isWindowsElp(fullpath);
		const processedPath = (isWindowsPath && isWindowsElp) ? misc.stripWindowsElp(fullpath) : fullpath;
		const divider = (isWindowsPath) ? "\\" : "/";

		let paths = processedPath.split(divider).map(function(path, p)
		{
			const leadSlash = (p > 0) ? (isWindowsPath) ? "\\" : "/" : "";

			if(path.length >= config.minimumSearchPhraseLength)
			{
				const link = <a href={"#" + router.buildPath("search", {q: `"file_path:${path}"`})}>{_this.highlightSearches(path, search)}</a>;
				return <span key={p}>{leadSlash}{link}</span>;
			}
			else
				return <span key={p}>{leadSlash}{_this.highlightSearches(path, search)}</span>;

			return path;
		});

		return paths;
	}

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
			const link = <a href={"#" + router.buildPath("search", {q: `"filename:${item.value}"`})}>{this.highlightSearches(item.value, search)}</a>;
			return <tr key={m} className={key}><td className="name">{label}:</td><td className="value">{link}</td><td className="empty"></td></tr>;
		}

		return null;
	};

	renderFilePathRow = (m, key, label, value, search) =>
	{
		const _this = this;

		const item = this.findItemContainingKey(value, "name", "file_path");
		if(item)
		{
			let paths = _this.createSearchPath(item.value, search);
			return <tr key={m} className={key}><td className="name">{label}:</td><td className="value">{paths}</td><td className="empty"></td></tr>;
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
					const linkHref = "#" + router.buildPath("search", {q: `"tag:${tag.name}"`});

					const html =
					(
						<a key={t} className={className} style={{background: "#"+tag.color, color: "#"+misc.calculateContrastColor(tag.color)}} href={linkHref}>
							{_this.highlightSearches(tag.name, search)}
						</a>
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
		const block_type = data.block.type.toLowerCase();

		const metrics =
		[
			["id", "ID/Type/Timestamp", data.block],
			["hash", "Block Hash", data.block.hash],
			["data_hash", "Data Hash", data.block.data_hash],
			["email", "Email", data],
			["filename", "Filename", data.meta],
			["file_path", "File Path", data.meta],
			["meta_hash", "Meta Hash", data.block.meta_hash],
			["text", "Text", data.data],
			["tags", "Tags", data.tags],
			["image-preview", "Preview", data],
			["view-on-block-explorer", "View", data],
			["download", "Download", data.block.id],
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
			{
				const id_link = <a href={"/#/block/"+value.id}>{value.id}</a>;
				const type_link = <a href={"#" + router.buildPath("search", {q: `"type:${value.type}"`})}>{value.type}</a>;
				const timestamp = misc.timestampToDate(value.timestamp);
				row = <tr key={m} className={key}><td className="name">{label}:</td><td className="value">{id_link} ({type_link}) <div className="timestamp">{timestamp}</div></td><td className="empty"></td></tr>;
			}

			else if(key === "type" || key === "block_time")
				row = <tr key={m} className={key}><td className="name">{label}:</td><td className="value">{value}</td><td className="empty"></td></tr>;

			else if(key === "data_hash")
			{
				if(block_type === "data" || search.startsWith("data_hash:"))
					row = <tr key={m} className={key}><td className="name">{label}:</td><td className="value">{_this.highlightSearches(value, search)}</td><td className="empty"></td></tr>;
			}

			else if(key === "email")
			{
				if(block_type === "email")
				{
					const items = [];
					// items.push(_this.findItemContainingKey(value.meta, "name", "date"));
					items.push(_this.findItemContainingKey(value.meta, "name", "from"));
					items.push(_this.findItemContainingKey(value.meta, "name", "to"));
					items.push(_this.findItemContainingKey(value.meta, "name", "subject"));
					// items.push(_this.findItemContainingKey(value.meta, "name", "source"));

					const rows = [];
					items.forEach(function(item, i)
					{
						if(item)
						{
							if(item.name === "subject" || _this.areTermsPresent(item.value, search))
								rows.push(<tr key={i} className={key}><td className="name">{item.name}:</td><td className="value">{_this.highlightSearches(item.value, search)}</td><td className="empty"></td></tr>);
						}
					});

					if(rows.length > 0)
						row = <React.Fragment key={m}>{rows}</React.Fragment>;
				}
			}

			else if(key === "filename")
			{
				const item = _this.findItemContainingKey(value, "name", key);
				if(item && (block_type === "file" || block_type === "filehash" || _this.areTermsPresent(item.value, search) || search.startsWith("filename:")))
				{
					row = _this.renderFilenameRow(m, key, label, value, search);
				}
			}

			else if(key === "file_path")
			{
				const item = _this.findItemContainingKey(value, "name", key);
				if(item && (block_type === "file" || block_type === "filehash" || _this.areTermsPresent(item.value, search) || search.startsWith("file_path:")))
				{
					row = _this.renderFilePathRow(m, key, label, value, search);
				}
			}

			else if(key === "hash")
			{
				if(_this.areTermsPresent(value, search) || search.startsWith("hash:"))
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

			else if(key === "meta_hash")
			{
				if(search.startsWith("meta_hash:"))
					row = <tr key={m} className={key}><td className="name">{label}:</td><td className="value">{_this.highlightSearches(value, search)}</td><td className="empty"></td></tr>;
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
				else if(_.has(value, "data") && block_type === "hash")
				{
					const text = misc.uintToString(value.data);
					row = <tr key={m} className={key}><td className="name">Hash:</td><td className="value text"><div>{text}</div></td><td className="empty"></td></tr>;
				}
			}

			else if(key === "tags")
			{
				if(_this.areTermsPresent(value.map((o)=>o.name).join(" "), search) || search.startsWith("tag:"))
				{
					row = _this.renderTagRow(m, key, label, value, search);
				}
			}

			else if(key === "view-on-block-explorer")
			{
				if(block_type === "sync" && misc.isJson(misc.uintToString(value.data.data)))
				{
					const json = JSON.parse(misc.uintToString(value.data.data));
					const link = htmlHelpers.renderTransactionViewLink(json.chain, json.tx_hash);
					row = <tr key={m} className={key}><td className="name">{label}:</td><td className="value">{link}</td><td className="empty"></td></tr>;
				}
			}

			else if(key === "download")
			{
				if(block_type === "data" || block_type === "email" || block_type === "file" || block_type === "text")
				{
					row =
					(
						<tr key={m} className={key}>
							<td className="name">{label}:</td>
							<td className="value">
								<a href={api.apiUrlFromRelativePath("/api/file-download/"+value)}>Download</a>
								{" "}
								{(block_type !== "data") && <a href={api.apiUrlFromRelativePath("/api/file-inline/"+value)} target="_blank">Open in New Window</a>}
							</td>
							<td className="empty"></td>
						</tr>
					);
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
