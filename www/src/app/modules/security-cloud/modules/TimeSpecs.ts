export class TimeView {
    bgn: number; ///< End time of a view
    end: number; ///< Begin time of a view
    res: number; ///< Resolution table index
}

export class TimeSelection {
    bgn: number; ///< Begin time of a selected interval
    end: number; ///< End time of selected interval
}

export class TimeSpecs {
    view: TimeView = new TimeView;
    sel: TimeSelection = new TimeSelection;
}

const MILLISEC_PER_HOUR: number = 60 * 60 * 1000;
const HOURS_PER_DAY = 24;
const DAYS_PER_MONTH = 30;

/*
    Following table will be used to create dedicated dropdown, but mainly to determine distance
    between time.view.bgn and time.view.end. This table is indexed with time.view.res
*/
export const ResolutionTable = [
    { value: 6 * MILLISEC_PER_HOUR, label: '6 Hours' },
    { value: 12 * MILLISEC_PER_HOUR, label: '12 Hours' },
    { value: HOURS_PER_DAY * MILLISEC_PER_HOUR, label: '1 Day' },
    { value: 2 * HOURS_PER_DAY * MILLISEC_PER_HOUR, label: '2 Days' },
    { value: 4 * HOURS_PER_DAY * MILLISEC_PER_HOUR, label: '4 Days' },
    { value: 7 * HOURS_PER_DAY * MILLISEC_PER_HOUR, label: '1 Week' },
    { value: 2 * 7 * HOURS_PER_DAY * MILLISEC_PER_HOUR, label: '2 Weeks' },
    { value: DAYS_PER_MONTH * HOURS_PER_DAY * MILLISEC_PER_HOUR, label: '1 Month' },
    { value: 2 * DAYS_PER_MONTH * HOURS_PER_DAY * MILLISEC_PER_HOUR, label: '2 Months' },
    { value: 6 * DAYS_PER_MONTH * HOURS_PER_DAY * MILLISEC_PER_HOUR, label: '6 Months' },
    { value: 8 * DAYS_PER_MONTH * HOURS_PER_DAY * MILLISEC_PER_HOUR, label: '8 Months' },
    { value: 12 * DAYS_PER_MONTH * HOURS_PER_DAY * MILLISEC_PER_HOUR, label: '1 Year' },
];
