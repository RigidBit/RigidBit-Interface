import hash from "hash.js";
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

		// Hash password before transmitting.
		data.password = misc.hashPassword(data.password);

		api.postUrlJson("/api/login", data)
		.then(function(data)
		{
			action(() => { store.user = data; })();

			const redirect = mobx.toJS(store.routeParams).redirect;
			if(redirect && redirect.length > 0 && misc.isJson(redirect))
			{
				const data = JSON.parse(redirect);
				router.navigate(data.route, data.routeParams);
			}
			else
			{
				router.navigate("dashboard");
			}
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
		let particleSettings = {"particles":{"number":{"value":150,"density":{"enable":true,"value_area":800}},"color":{"value":"#555555"},"shape":{"type":"circle","stroke":{"width":0,"color":"#000000"},"polygon":{"nb_sides":5},"image":{"src":"img/github.svg","width":100,"height":100}},"opacity":{"value":0.2,"random":false,"anim":{"enable":false,"speed":1,"opacity_min":0.1,"sync":false}},"size":{"value":2,"random":false,"anim":{"enable":false,"speed":40,"size_min":0.1,"sync":false}},"line_linked":{"enable":true,"distance":150,"color":"#555555","opacity":0.2,"width":1},"move":{"enable":true,"speed":2,"direction":"none","random":true,"straight":false,"out_mode":"bounce","bounce":false,"attract":{"enable":true,"rotateX":600,"rotateY":1200}}},"interactivity":{"detect_on":"canvas","events":{"onhover":{"enable":false,"mode":"repulse"},"onclick":{"enable":false,"mode":"push"},"resize":true},"modes":{"grab":{"distance":400,"line_linked":{"opacity":1}},"bubble":{"distance":400,"size":40,"duration":2,"opacity":8,"speed":3},"repulse":{"distance":200,"duration":0.4},"push":{"particles_nb":4},"remove":{"particles_nb":2}}},"retina_detect":true};
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
