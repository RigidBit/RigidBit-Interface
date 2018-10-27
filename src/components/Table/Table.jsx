import PropTypes from "prop-types";
import ReactTable from "react-table";

class Component extends React.PureComponent
{
	render()
	{
		const html =
		(
			<ReactTable
				className="react-table"
				data={this.props.data}
				columns={this.props.columns}
				defaultPageSize={9999}
				minRows={0}
				multiSort={false}
				resizable={false}
				showPagination={false}
				{...this.props}
			/>
		);
		return html;
	}
}

Component.propTypes =
{
	columns: PropTypes.array.isRequired,
	data: PropTypes.array.isRequired,
};

export default Component;
