export class TimeView {
	bgn : number; ///< End time of a view
	end : number; ///< Begin time of a view
	res : number; ///< Resolution table index
}

export class TimeSelection {
	bgn : number; ///< Begin time of a selected interval
	end : number; ///< End time of selected interval
}

export class TimeSpecs {
	view : TimeView = new TimeView;
	sel : TimeSelection = new TimeSelection;
}