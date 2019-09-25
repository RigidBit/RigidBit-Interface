export const colorsDefault = ["#0e3d59", "#89a51c", "#f29f05", "#f25c05", "#d92526", "#62340c", "#1e92d0", "#5a71c2", "#aaaaaa", "#777777"];

export const dataBaseSet1 =
{
	labels: [],
	datasets:
	[
		{
			data: [],
			backgroundColor: colorsDefault,
		}
	],
};

export const dataBaseSet2 =
{
	labels: [],
	datasets:
	[
	],
};

export const optionsBase1 =
{
	animation: false,
	maintainAspectRatio: false,
	title:
	{
		display: true,
	},
	legend:
	{
		position: "bottom",
		labels:
		{
			boxWidth: 12,
		}
	},
};

export const optionsBase2 =
{
	animation: false,
	maintainAspectRatio: false,
	title:
	{
		display: true,
	},
	legend:
	{
		position: "bottom",
		labels:
		{
			boxWidth: 12,
		}
	},
	tooltips: {
		mode: "index",
		position: "nearest",
		intersect: false,
	},
};
