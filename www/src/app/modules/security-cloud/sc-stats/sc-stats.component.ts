// Global modules
import { Component, Input, OnInit, OnChanges,
SimpleChanges } from '@angular/core';

// Local modules
import { ProfileMap } from '../modules/Profile';
import { TimeSelection } from '../modules/TimeSpecs';

// Services
import { ScStatService } from './sc-stats.service';

@Component({
    selector: 'sc-stats',
    templateUrl: './sc-stats.component.html',
    styleUrls: ['./sc-stats.component.scss'],
    providers: [ ScStatService ]
})
export class ScStatsComponent implements OnInit, OnChanges {
    /* EXTERNAL VARIABLES */
    @Input() profiles: ProfileMap;
    @Input() selectedProfile: string;
    @Input() sel: TimeSelection;
    @Input() timeUpdated: boolean;

    /* INTERNAL VARIABLES */
    error: any = null; ///< Http request error storage
    toggled = false; ///< Whether statistics are visible
    tables = [ ///< Auxiliary labels and indices for rendering
        { name: 'Flows', indices: [0, 1, 2, 3, 4] },
        { name: 'Packets', indices: [5, 6, 7, 8, 9] },
        { name: 'Bytes', indices: [10, 11, 12, 13, 14] }
    ];
    labels = ['Channel', 'All', 'TCP', 'UDP', 'ICMP', 'Other']; ///< Column labels
    stats = null; ///< This object will be filled by http request to api
    maxes = { ///< Index of row with max value within each section
        'Rate': [0, 0, 0],
        'Sum': [0, 0, 0]
    };

    constructor(private api: ScStatService) {}

    ngOnInit() { }

    ngOnChanges(changes: SimpleChanges) {
        if (!this.toggled) {
            return;
        }

        for (const x in changes) {
            if (x === 'timeUpdated' || x === 'selectedProfile') {
                this.getData();
            }
        }
    }

    /**
     *  @brief Toggles visibility of statistics content
     */
    toggleThis() {
        this.toggled = !this.toggled;

        if (this.toggled) {
            this.getData();
        }
    }

    /**
     *  @brief Sends a request for data to api
     *
     *  @details On success, data will be passed to processData(), on failure
     *  error will be passed to processError()
     */
    getData() {
        this.api.stats(this.sel.bgn, this.sel.end, this.selectedProfile).subscribe(
            (data: Object) => this.processData(data),
            (error: Object) => this.processError(error));
    }

    /**
     *  @brief Handle method for processing retrieved data
     *
     *  @param [in] data Object containing relevant data
     *
     *  @details Data should look like this:
     *  {
     *      'Rate:' [[...],...],
     *      'Sum': [[...],...],
     *  }
     *  Either rate and sum are arrays with the same number of subarrays. Each
     *  subarray have exactly fifteen numbers in them. Each five numbers
     *  represents a metric (Flow, Packets, Bits).
     */
    processData (data: any) {
        // Find maxima
        for (const x of ['Rate', 'Sum']) {
            for (let i = 0; i < 3; i++) {
                // First clear old value
                this.maxes[x][i] = 0;

                for (let r = 1; r < data[x].length - 1; r++) {
                    if (data[x][r][i * 5] > data[x][this.maxes[x][i]][i * 5]) {
                        this.maxes[x][i] = r;
                    }
                }
            }
        }

        this.stats = data;
    }

    /**
     *  @brief Handle method for processing errors
     *
     *  @param [in] error Object containing error details
     */
    processError(error: Object) {
        if (error['status'] >= 404) {
            this.error = error;
        }

        console.error('Error when retrieving statistics:');
        console.error(error);
    }
}
