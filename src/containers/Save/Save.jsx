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
		this.textForm = React.createRef();
		this.textArea = React.createRef();
		this.counter = React.createRef();
	}

	componentDidMount()
	{
		this.handleFileChange();
		this.handleTextAreaChange();
		this.textArea.current.focus();
		this.fileInit();
	}

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
			filename.innerText = "Choose a file.";
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
		const url = "/api/file";

		_this.formDataSppendFiles(formData, _this.file.current);

		api.postUrl(url, formData, false)
		.then(function(data)
		{
			_this.fileForm.current.reset();
			_this.handleFileChange();

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

	render()
	{
		const html =
		(
			<section className="save">
				<Header />
				<Navigation />

				<div className="content">
					<h1>Save to the Blockchain</h1>

					<div className="fileContainer">
						<h2>File</h2>
						<p className="description">
							Upload and store a file of any type in the blockchain.
						</p>
						<form ref={this.fileForm} action="/api/file" method="post" encType="multipart/form-data" onSubmit={this.handleFormSubmit}>
							<label className="file">
								<input ref={this.file} type="file" name="file" />
								<i className="fas fa-file-upload"></i>
								<span ref={this.filename} className="filename"></span>
							</label>
							<div className="buttonContainer">
								<button className="submit" onClick={this.handleFileSubmitButtonClick}><i className="far fa-save icon"></i><span>Save</span></button>
							</div>
						</form>
					</div>

					<div className="textContainer">
						<h2>Text Message</h2>
						<p className="description">
							Save a plain text message in the blockchain.
						</p>
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

				</div>

				<Footer />
			</section>
		);
		return html;
	}
}

export default Component;
