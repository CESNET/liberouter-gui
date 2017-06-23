// Global modules
import { Component, Input, OnInit } from '@angular/core';

// Local modules
import { ProfileMap } from '../modules/Profile';
import { TimeSelection } from '../modules/TimeSpecs';

// Services
import { ScDbqryService } from './sc-dbqry.service';

@Component({
    selector: 'sc-dbqry',
    templateUrl: './sc-dbqry.component.html',
    styleUrls: ['./sc-dbqry.component.scss'],
    providers: [ ScDbqryService ]
})
export class ScDbqryComponent implements OnInit {
    /* EXTERNAL VARIABLES */
    @Input() profiles: ProfileMap;
    @Input() selectedProfile: string;
    @Input() sel: TimeSelection;

    /* INTERNAL VARIABLES */
    limitto = [
        {value: '-l 10', desc: '10 records'},
        {value: '-l 20', desc: '20 records'},
        {value: '-l 50', desc: '50 records'},
        {value: '-l 100', desc: '100 records'},
        {value: '-l 200', desc: '200 records'},
        {value: '-l 500', desc: '500 records'},
        {value: '-l 1000', desc: '1000 records'},
        {value: '-l 2000', desc: '2000 records'},
        {value: '-l 5000', desc: '5000 records'},
        {value: '-l 10000', desc: '10000 records'}
    ];
    selectedLimit = '-l 10'; ///< Selection index to limitto
    fields;
    selectedOrderBy: string;
    error: any = null;

    constructor(private api: ScDbqryService) { }

    ngOnInit() {
        this.api.fields().subscribe(
            (data: Object) => this.processData(data),
            (error: Object) => this.processError(error));
    }

    processData(data: Object) {
        /* NOTE: What data look like
        [
            {'name': '...', 'hint': '...'}
        ]
        */
        this.fields = data;
        this.selectedOrderBy = this.fields[0].name;
    }

    processError(error: Object) {
        if (error['status'] >= 404) {
            this.error = error;
        }

        console.error('Error when retrieving dbqry fields:');
        console.error(error);
    }
}
