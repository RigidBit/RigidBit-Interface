import PropTypes from "prop-types";

class Component extends React.PureComponent
{
	renderItems = (items) =>
	{
		let _this = this;

		let lis = [];
		items.forEach(function(item, i)
		{
			const className = (item.name === _this.props.selectedName) ? "selected" : "";
			const li = <li key={i}><a className={className} href={router.buildUrl(item.route, item.routeParams)}>{item.label}</a></li>;
			lis.push(li);
		});

		return <ul>{lis}</ul>;
	};

	render()
	{
		const items = this.renderItems(this.props.items);

		const html =
		(
			<div className={this.props.className}>
				<i className="fas fa-angle-double-right"></i>
				{items}
			</div>
		);
		return html;
	}
}

Component.defaultProps =
{
	className: "subnavigation" 
};

Component.propTypes =
{
	selectedName: PropTypes.string,
	items: PropTypes.array.isRequired,
};

export default Component;
