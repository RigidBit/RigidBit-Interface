import Footer from "../../components/Footer/Footer.jsx";
import Header from "../../components/Header/Header.jsx";
import Navigation from "../../components/Navigation/Navigation.jsx";

class Component extends React.Component
{
	componentDidMount()
	{
	}

	componentWillUnmount()
	{
	}

	render()
	{
		const html =
		(
			<section className="message">
				<Header />
				<Navigation />

				<div className="content">
					<h1>Message</h1>
				</div>

				<Footer />
			</section>
		);
		return html;
	}
}

export default Component;
