import iziToast from "izitoast";

import Footer from "../../components/Footer/Footer.jsx";
import Header from "../../components/Header/Header.jsx";
import Navigation from "../../components/Navigation/Navigation.jsx";

class Component extends React.Component
{
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
		this.handleFileChange();
		this.handleTextAreaChange();
		this.fileInit();
	}

	fileHashCheckboxChanged = (e) =>
	{
		const checked = this.fileHash.current.checked;
		$(".filehashWarning").toggleClass("visible", checked);
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

	handleKeyPress = (e) =>
	{
		if(e.key === 'Enter' && e.ctrlKey)
			this.handleTextSubmitButtonClick();
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

	handleFormSubmit = (e) =>
	{
		e.preventDefault();
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

		_this.formDataSppendFiles(formData, _this.file.current);

		api.postUrl(url, formData, false)
		.then(function(data)
		{
			_this.fileForm.current.reset();
			_this.handleFileChange();
			_this.fileHashCheckboxChanged();

			iziToast.success({title: "Success", message: data.message});
		})
		.catch(function(error)
		{
			log.error(error);
			iziToast.error({title: "Error", message: error});
		});
	}

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

		api.postUrl("/api/text", data, false)
		.then(function(data)
		{
			_this.textForm.current.reset();
			_this.handleTextAreaChange();

			iziToast.success({title: "Success", message: data.message});
		})
		.catch(function(error)
		{
			log.error(error);
			iziToast.error({title: "Error", message: error});
		});
	}

	handleTimestampSubmitButtonClick = (e) =>
	{
		if(e)
			e.preventDefault();

		api.postUrl("/api/timestamp", null, false)
		.then(function(data)
		{
			iziToast.success({title: "Success", message: data.message});
		})
		.catch(function(error)
		{
			log.error(error);
			iziToast.error({title: "Error", message: error});
		});
	}

	render()
	{
		const html =
		(
			<section className="upload">
				<Header />
				<Navigation />

				<div className="content">
					<h1>Upload</h1>

					<div className="fileContainer">
						<h2>File</h2>
						<div className="description">
							Upload and store a file of any type in the blockchain.
							<p className="filehashWarning">
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
							<div className="buttonContainer">
								<button className="submit" onClick={this.handleFileSubmitButtonClick}><i className="far fa-save icon"></i><span>Save</span></button>
							</div>
						</form>
					</div>

					<div className="textContainer">
						<h2>Text Message</h2>
						<div className="description">
							Save a plain text message in the blockchain.
						</div>
						<form ref={this.textForm} action="/api/text" method="post" encType="multipart/form-data" onSubmit={this.handleFormSubmit}>
							<div className="textarea">
								<textarea ref={this.textArea} name="text" maxLength="100000" onChange={this.handleTextAreaChange} onKeyUp={this.handleKeyPress}></textarea>
								<span ref={this.counter} className="counter">123</span>
							</div>
							<div className="buttonContainer">
								<button className="submit" onClick={this.handleTextSubmitButtonClick}><i className="far fa-save icon"></i>Save</button>
							</div>
						</form>
					</div>

					<div className="timestampContainer">
						<h2>Timestamp</h2>
						<div className="description">
							Create a manual timestamp entry in the blockchain.
						</div>
						<form ref={this.timestampForm} action="/api/timestamp" method="post" encType="multipart/form-data" onSubmit={this.handleFormSubmit}>
							<div className="buttonContainer">
								<button className="submit" onClick={this.handleTimestampSubmitButtonClick}><i className="far fa-save icon"></i>Save</button>
							</div>
						</form>
					</div>

				</div>

				<Footer />
			</section>
		);
		return html;
	}
}

export default Component;
