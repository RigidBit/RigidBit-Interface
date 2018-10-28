import iziToast from "izitoast";
import Select from "react-select";

import * as htmlHelpers from "../../common/js/html.jsx";
import * as reactSelect from "../../common/js/react-select.js";

import Footer from "../../components/Footer/Footer.jsx";
import Header from "../../components/Header/Header.jsx";
import Navigation from "../../components/Navigation/Navigation.jsx";

@observer class Component extends React.Component
{
	@observable data = {};
	@observable selectedFileTags = [];
	@observable selectedTextTags = [];

	constructor(props)
	{
		super(props);

		this.file = React.createRef();
		this.filename = React.createRef();
		this.fileForm = React.createRef();
		this.fileHash = React.createRef();
		this.textForm = React.createRef();
		this.textArea = React.createRef();
		this.timestampForm = React.createRef();
		this.counter = React.createRef();
	}

	componentDidMount()
	{
		this.refreshData();
	}

	componentDidUpdate()
	{
		if(this.isDataReady())
		{
			this.handleFileChange();
			this.handleTextAreaChange();
			this.fileInit();
		}
	}

	fileHashCheckboxChanged = (e) =>
	{
		const checked = this.fileHash.current.checked;
		$(".filehash-warning").toggleClass("visible", checked);
	};

	fileInit = () =>
	{
		this.file.current.addEventListener("change", this.handleFileChange);
	};

	formDataSppendFiles = (formData, fileSelect) =>
	{
	    let files = fileSelect.files;
	    for (let i = 0; i < files.length; i++)
	    {
	        let name = "file" + i;
	        let file = files[i];
	        formData.append(name, file, file.name);
	    }

		return formData;
	};

	generateTagSelectOptions = () =>
	{
		const selectOptions = this.data.tags.filter((item)=>!item.hidden).map(function(item, i)
		{
			const option =
			{
				color: item.color,
				label: item.name,
				value: item.id,
			};
			return option;
		});
		return selectOptions;
	};

	handleFileChange = (e) =>
	{
		const file = this.file.current;
		const filename = this.filename.current;
		const fileSelected = file.value.length > 0;

		// Toggle file-selected class based on select status.
		$(file).parent().toggleClass("file-selected", fileSelected);

		if(fileSelected)
		{
			// Populate the filename field.
			filename.innerText = file.value.replace(/.*[\/\\]/, "");
		}
		else
			filename.innerText = "Choose a file, or drag it here.";
	};

	handleFileDragLeave = (e) =>
	{
		e.preventDefault();
		e.stopPropagation();

		this.handleFileDragToggle($(e.target).closest("form"), false);
	};

	handleFileDragOver = (e) =>
	{
		e.preventDefault();
		e.stopPropagation();

		this.handleFileDragToggle($(e.target).closest("form"), true);
	};

	handleFileDrop = (e) =>
	{
		e.preventDefault();
		e.stopPropagation();

		this.handleFileDragToggle($(e.target).closest("form"), false);
		this.handleFileChange();

		const file = this.file.current;
		const files = e.dataTransfer.files;

		if(files.length > 0)
		{
			file.files = files;
		}
	};

	handleFileDragToggle = (target, isDragging) =>
	{
		$(target).toggleClass("dragging", isDragging);
	};

	handleFileTagsChange = (data) =>
	{
		this.updateSelectedFileTags(data);
	};

	handleFormSubmit = (e) =>
	{
		e.preventDefault();
	};

	handleKeyPress = (e) =>
	{
		if(e.key === 'Enter' && e.ctrlKey)
			this.handleTextSubmitButtonClick();
	};

	handleTextAreaChange = (e) =>
	{
		const textArea = this.textArea.current;
		const counter = this.counter.current;

		counter.innerText = textArea.maxLength - textArea.value.length;
	};

	handleFileSubmitButtonClick = (e) =>
	{
		if(e)
			e.preventDefault();

		const _this = this;

		if(_this.file.current.files.length === 0)
		{
			iziToast.error({title: "Error", message: "You must select a file before submitting."});
			return;
		}

		const formData = new FormData();
		const url = (!this.fileHash.current.checked) ? "/api/file" : "/api/filehash";

		formData.append("tags", _.map(_this.selectedFileTags, "value").join(","));
		_this.formDataSppendFiles(formData, _this.file.current);

		api.postUrl(url, formData, false)
		.then(function(data)
		{
			_this.fileForm.current.reset();
			_this.updateSelectedFileTags([]);
			_this.handleFileChange();
			_this.fileHashCheckboxChanged();

			const noun = (url === "/api/file") ? "File" : "Filehash";
			iziToast.success({title: "Success", message: `${noun} has been saved.`});
		})
		.catch(function(error)
		{
			log.error(error);
			iziToast.error({title: "Error", message: error});
		});
	};

	handleTextSubmitButtonClick = (e) =>
	{
		if(e)
			e.preventDefault();

		const _this = this;

		if(_this.textArea.current.value.length === 0)
		{
			iziToast.error({title: "Error", message: "You must provide a text message before submitting."});
			return;
		}

		const data = $(_this.textForm.current).serializeObject();
		data.tags = _.map(_this.selectedTextTags, "value").join(",");

		api.postUrl("/api/text", data, false)
		.then(function(data)
		{
			_this.textForm.current.reset();
			_this.updateSelectedTextTags([]);
			_this.handleTextAreaChange();

			iziToast.success({title: "Success", message: "Text has been saved."});
		})
		.catch(function(error)
		{
			log.error(error);
			iziToast.error({title: "Error", message: error});
		});
	};

	handleTextTagsChange = (data) =>
	{
		this.updateSelectedTextTags(data);
	};

	handleTimestampSubmitButtonClick = (e) =>
	{
		if(e)
			e.preventDefault();

		api.postUrl("/api/timestamp", null, false)
		.then(function(data)
		{
			iziToast.success({title: "Success", message: "Timestamp has been created."});
		})
		.catch(function(error)
		{
			log.error(error);
			iziToast.error({title: "Error", message: error});
		});
	};

	isDataReady = () =>
	{
		return (this.data.hasOwnProperty("tags"));
	};

	updateSelectedFileTags = action((data) =>
	{
		this.selectedFileTags = data;
		log.debug("UPDATE SELECTED FILE TAGS:", data);
	});

	updateSelectedTextTags = action((data) =>
	{
		this.selectedTextTags = data;
		log.debug("UPDATE SELECTED TEXT TAGS:", data);
	});

	updateData = action((data) =>
	{
		this.data = data;
		log.debug("UPDATE DATA:", this.data);
	});

	refreshClicked = (e) =>
	{
		e.preventDefault();

		this.refreshData();
	};

	refreshData = () =>
	{
		const _this = this;

		if(store.route !== "upload")
			return false;

		api.getUrl("/api/tags", true)
		.then(function(data)
		{
			const newData = _.merge(mobx.toJS(_this.data), {tags: null}, {tags: data});
			_this.updateData(newData);
		})
		.catch(function(error)
		{
			_this.refreshDataFailure(error);
		});
	};

	refreshDataFailure = (error) =>
	{
		this.updateData({});

		log.error(error);
		iziToast.error({title: "Error", message: error});
	};

	renderFile = () =>
	{
		if(!this.isDataReady())
			return htmlHelpers.renderLoading();

		const selectStyles = reactSelect.generateSelectStyles();
		const selectOptions = this.generateTagSelectOptions();

		const html =
		(
			<div>
				<div className="description">
					Upload and store a file of any type in the blockchain.
					<p className="filehash-warning">
						<span className="warning">Warning:</span> You have specified that you only want to store the hash of the file, but not the file data itself. The original file must be stored indefinitely in an external location or existance will not be able to be proven. If you don't understand the difference, uncheck this option.
					</p>
				</div>
				<form ref={this.fileForm} action="/api/file" method="post" encType="multipart/form-data" onSubmit={this.handleFormSubmit} onDrop={this.handleFileDrop} onDragOver={this.handleFileDragOver} onDragLeave={this.handleFileDragLeave} onDragExit={this.handleFileDragLeave}>
					<label className="file">
						<input ref={this.file} type="file" name="file" />
						<i className="fas fa-file-upload"></i>
						<span ref={this.filename} className="filename"></span>
						<label className="filehash"><input ref={this.fileHash} type="checkbox" name="filehash" value="1" onChange={this.fileHashCheckboxChanged} /> Store file hash only</label>
					</label>
					<div className="button-container">
						<Select className="react-select" classNamePrefix="react-select" options={selectOptions} styles={selectStyles} value={mobx.toJS(this.selectedFileTags)} onChange={this.handleFileTagsChange} isMulti placeholder="Select Tags..." />
						<button className="submit" onClick={this.handleFileSubmitButtonClick}><i className="far fa-save icon"></i><span>Save</span></button>
					</div>
				</form>
			</div>
		);
		return htmlHelpers.renderContainer("file-container", "File", html);
	};

	renderText = () =>
	{
		if(!this.isDataReady())
			return htmlHelpers.renderLoading();

		const selectStyles = reactSelect.generateSelectStyles();
		const selectOptions = this.generateTagSelectOptions();

		const html =
		(
			<div>
				<div className="description">
					Save a plain text message in the blockchain.
				</div>
				<form ref={this.textForm} action="/api/text" method="post" encType="multipart/form-data" onSubmit={this.handleFormSubmit}>
					<div className="textarea">
						<textarea ref={this.textArea} name="text" maxLength="100000" onChange={this.handleTextAreaChange} onKeyUp={this.handleKeyPress}></textarea>
						<span ref={this.counter} className="counter">123</span>
					</div>
					<div className="button-container">
						<Select className="react-select" classNamePrefix="react-select" options={selectOptions} styles={selectStyles} value={mobx.toJS(this.selectedTextTags)} onChange={this.handleTextTagsChange} isMulti placeholder="Select Tags..." />
						<button className="submit" onClick={this.handleTextSubmitButtonClick}><i className="far fa-save icon"></i>Save</button>
					</div>
				</form>
			</div>
		);
		return htmlHelpers.renderContainer("text-container", "Text Message", html);
	};

	renderTimestamp = () =>
	{
		if(!this.isDataReady())
			return htmlHelpers.renderLoading();

		const html =
		(
			<div>
				<div className="description">
					Create a manual timestamp entry in the blockchain.
				</div>
				<form ref={this.timestampForm} action="/api/timestamp" method="post" encType="multipart/form-data" onSubmit={this.handleFormSubmit}>
					<div className="button-container">
						<button className="submit" onClick={this.handleTimestampSubmitButtonClick}><i className="far fa-save icon"></i>Save</button>
					</div>
				</form>
			</div>
		);
		return htmlHelpers.renderContainer("timestamp-container", "Timestamp", html);
	};

	render()
	{
		const file = this.renderFile();
		const text = this.renderText();
		const timestamp = this.renderTimestamp();

		const html =
		(
			<section className="upload">
				<Header />
				<Navigation />

				<div className="content">
					<h1>Upload<a href="#refresh" className="refresh" onClick={this.refreshClicked} title="Refresh"><i className="fas fa-sync-alt"></i></a></h1>
					{file}
					{text}
					{timestamp}
				</div>

				<Footer />
			</section>
		);
		return html;
	}
}

export default Component;
