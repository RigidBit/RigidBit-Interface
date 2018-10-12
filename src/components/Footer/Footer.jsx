@observer class Component extends React.Component
{
	@observable floatFooter = false; // State for floating the footer.
	handleResize = null; // A debouced handler for resizing.
	checkTimer = null; // The interval timer for checking for document body size changes.
	checkDelay = config.footerResizeTimerInterval; // The check interval for the checkTimer.

	componentDidMount()
	{
		// Create the debouced resize handler.
		this.handleResize = _.debounce(this.handleResizeReal, config.debouceDelayDefault);

		// Add the resize listener to the window.
		$(window).on("resize", null, this.handleResize);
		this.handleResizeReal();

		// Start the check timer.
		this.checkTimer = setInterval(() =>
		{
			this.handleResize();
		}, this.checkDelay);
	}

	componentWillUnmount()
	{
		// Remove the resize listener from the window.
		if(this.handleResize)
		{
			$(window).off("resize", null, this.handleResize);
			this.handleResize = null;
		}

		// Stop the check timer.
		if(this.checkTimer)
		{
			clearInterval(this.checkTimer);
			this.checkTimer = null;
		}
	}

	handleResizeReal = () =>
	{
		const $body = $("body");
		const $footer = $("footer.main");
		const $window = $(window);

		const bodyHeight = $body.height();
		const footerHeight = $footer.outerHeight();
		const windowHeight = $window.height();

		action(function(_this)
		{
			_this.floatFooter = (windowHeight > bodyHeight + footerHeight);
		})(this);
	};

	render()
	{
		let year = 2018;
		if(new Date().getFullYear() > year)
			year = year + "-" + new Date().getFullYear();

		const copyright = `Copyright <i class="far fa-copyright"></i> ${year} RigidBit, LLC.`;

		let className = "main";
		if(this.floatFooter)
			className += " floating";

		return <footer className={className} dangerouslySetInnerHTML={{__html: copyright}} />;
	}
}

export default Component;
