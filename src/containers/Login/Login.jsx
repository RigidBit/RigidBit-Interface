import * as alert from "../../components/Alert/alert.js";
import * as misc from "../../common/js/misc.js";

@observer class Login extends React.Component
{
	@observable formDisabled = false;
	@observable loginVisible = false;

	constructor(props)
	{
		super(props);

		this.loginForm = React.createRef();
		this.username = React.createRef();
	}

	componentDidMount()
	{
		this.checkLogin();
	}

	checkLogin = () =>
	{
		const _this = this;

		api.getUrl("/api/login-check", false)
		.then(function(data)
		{
			action(() => { store.user = data; })();
			router.navigate("dashboard");
		})
		.catch(function(error)
		{
			_this.disableForm(false);
			_this.showLogin(true);
			_this.username.current.focus();
		});
	};

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

	showLogin = (show) =>
	{
		action(()=>
		{
			this.loginVisible = show;
		})();
	};

	render()
	{
		const loginClassName = (this.loginVisible) ? "login show" : "login";
		const formDisabled = this.formDisabled;

		const html =
		(
			<section className={loginClassName}>
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
			</section>
		);
		return html;
	}
}

export default Login;
