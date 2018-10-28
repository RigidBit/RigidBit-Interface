import * as misc from "../../common/js/misc.js";

export function generateSelectStyles()
{
	const selectStyles =
	{
		option: (base, state) =>
		{
			const obj =
			{
				...base,
				// backgroundColor: "#"+state.data.color,
			};
			return obj;
		},
		multiValueLabel: (base, state) =>
		{
			const obj =
			{
				...base,
				backgroundColor: "#"+state.data.color,
				color: "#"+misc.calculateContrastColor(state.data.color),
			};
			return obj;
		},
		multiValueRemove: (base, state) =>
		{
			const obj =
			{
				...base,
				backgroundColor: "#"+state.data.color,
				color: "#"+misc.calculateContrastColor(state.data.color),
			};
			return obj;
		},
	};
	return selectStyles;
}
