import iziToast from "izitoast";

import Footer from "../../components/Footer/Footer.jsx";
import Header from "../../components/Header/Header.jsx";
import Navigation from "../../components/Navigation/Navigation.jsx";

class Component extends React.Component
{
	constructor(props)
	{
		super(props);

		this.form = React.createRef();
		this.textArea = React.createRef();
		this.counter = React.createRef();
	}

	componentDidMount()
	{
		this.handleTextAreaChange();
		this.textArea.current.focus();
	}

	handleKeyPress = (e) =>
	{
		if(e.key === 'Enter' && e.ctrlKey)
			this.handleSubmitButtonClick();
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

	handleSubmitButtonClick = (e) =>
	{
		if(e)
			e.preventDefault();

		const _this = this;

		const data = $(this.form.current).serializeObject();

		api.postUrl("/api/text", data, false)
		.then(function(data)
		{
			_this.textArea.current.value = "";
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
					<div className="textContainer">
						<h2>Text Message</h2>
						<p className="description">
							Save a plain text message in the blockchain.
						</p>
						<form ref={this.form} action="/api/text" method="post" encType="multipart/form-data" onSubmit={this.handleFormSubmit}>
							<div className="textarea">
								<textarea ref={this.textArea} name="text" maxLength="100000" onChange={this.handleTextAreaChange} onKeyUp={this.handleKeyPress}></textarea>
								<span ref={this.counter} className="counter">123</span>
							</div>
							<button className="submit" onClick={this.handleSubmitButtonClick}><i className="far fa-save icon"></i>Save</button>
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
