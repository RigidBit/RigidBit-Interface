import "particles.js";

import * as alert from "../../components/Alert/alert.js";
import * as misc from "../../common/js/misc.js";

@observer class Login extends React.Component
{
	@observable formDisabled = false;
	handleResize = null; // A debouced handler for resizing.

	constructor(props)
	{
		super(props);

		this.loginForm = React.createRef();
		this.username = React.createRef();
	}

	componentDidMount()
	{
		// Create the debouced resize handler.
		this.handleResize = _.debounce(this.handleResizeReal, config.debouceDelayDefault);

		// Call the resize handler. This also calls initParticlesJs().
		this.handleResizeReal();

		this.initResizeHandler(true);

		if(this.username.current)
			this.username.current.focus();
	}

	componentWillUnmount()
	{
		this.initResizeHandler(false);
		this.stopParticlesJs();
	}

	disableForm = (disable) =>
	{
		return;
		action(()=>
		{
			this.formDisabled = disable;
		})();
	};

	handleFormSubmit = (e) =>
	{
		if(e)
			e.preventDefault();

		const _this = this;

		this.disableForm(true);

		const data = $(this.loginForm.current).serializeObject();

		api.postUrl("/api/login", data, false)
		.then(function(data)
		{
			action(() => { store.user = data; })();
			router.navigate("dashboard");
		})
		.catch(function(error)
		{
			log.error(error);
			alert.show(error);
			_this.disableForm(false);
		});
	};

	handleResizeReal = () =>
	{
		this.stopParticlesJs();

		const $window = $(window);
		const windowHeight = $window.height();
		$("#particles-js").height(windowHeight);

		this.initParticlesJs();
	};

	initParticlesJs = () =>
	{
		let particleSettings = {"particles":{"number":{"value":200,"density":{"enable":true,"value_area":1200}},"color":{"value":"#aaaaaa"},"shape":{"type":"polygon","stroke":{"width":0,"color":"#000000"},"polygon":{"nb_sides":4},"image":{"src":"img/github.svg","width":100,"height":100}},"opacity":{"value":0.1,"random":true,"anim":{"enable":false,"speed":1,"opacity_min":0.1,"sync":false}},"size":{"value":50,"random":true,"anim":{"enable":false,"speed":40,"size_min":0.1,"sync":false}},"line_linked":{"enable":false,"distance":224.4776885211732,"color":"#ff0000","opacity":0.24051180912982842,"width":4.970577388683121},"move":{"enable":true,"speed":0.5,"direction":"bottom","random":true,"straight":true,"out_mode":"out","bounce":false,"attract":{"enable":false,"rotateX":0,"rotateY":0}}},"interactivity":{"detect_on":"canvas","events":{"onhover":{"enable":false,"mode":"repulse"},"onclick":{"enable":false,"mode":"push"},"resize":true},"modes":{"grab":{"distance":400,"line_linked":{"opacity":1}},"bubble":{"distance":400,"size":40,"duration":2,"opacity":8,"speed":3},"repulse":{"distance":200,"duration":0.4},"push":{"particles_nb":4},"remove":{"particles_nb":2}}},"retina_detect":true};
		particlesJS("particles-js", particleSettings);
	};

	initResizeHandler = (enable) =>
	{
		if(enable)
		{
			$(window).on("resize", null, this.handleResize);
		}
		else
		{
			if(this.handleResize)
			{
				$(window).off("resize", null, this.handleResize);
				this.handleResize = null;
			}
		}
	};

	stopParticlesJs = () =>
	{
		pJSDom.forEach(function(item)
		{
			item.pJS.fn.vendors.destroypJS();
		});

		if(!window.pJSDom)
			window.pJSDom = [];
	};

	render()
	{
		const formDisabled = this.formDisabled;

		const html =
		(
			<section className="login">
				<div id="particles-js"></div>
				<div className="loginBox show">
					<div className="logo">
						<img src={misc.rigidBitLogo()} alt="RigidBit Logo" />
					</div>
					<form ref={this.loginForm} action="/api/login" method="post" encType="multipart/form-data" onSubmit={this.handleFormSubmit}>
						<div className="input-container username">
							<input ref={this.username} type="text" name="username" placeholder="Username" autoComplete="username" disabled={formDisabled} />
							<i className="fas fa-user"></i>
						</div>
						<div className="input-container password">
							<input type="password" name="password" placeholder="Password" autoComplete="current-password" disabled={formDisabled} />
							<i className="fas fa-key"></i>
						</div>
						<input type="submit" value="Log In" disabled={formDisabled} onClick={this.handleFormSubmit} />
					</form>
				</div>
			</section>
		);
		return html;
	}
}

export default Login;
