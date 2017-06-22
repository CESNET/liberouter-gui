import { Component, OnInit, OnDestroy} from '@angular/core';
import { NemeaStatusService } from './nemea_status.service';

@Component({
    selector : 'nemea-status',
    templateUrl : './nemea_status.html',
    styleUrls : ['./nemea_status.css'],
    providers : [NemeaStatusService]
})
export class NemeaStatusComponent implements OnInit, OnDestroy {
    error: Object;
    refreshing: Boolean = false;
    last_refresh_time: Date = new Date();
    img_path: any;
    data: Object;
    id: any;

    intervals = [
        {value: 1, viewValue: '1 s'},
        {value: 2, viewValue: '2 s'},
        {value: 5, viewValue: '5 s'},
        {value: 10, viewValue: '10 s'},
        {value: 30, viewValue: '30 s'},
        {value: 60, viewValue: '60 s'},
        {value: -1, viewValue: 'Paused'},
    ];

    // Refresh interval in seconds
    refresh_interval = 5;

    constructor(private api: NemeaStatusService) {}

    ngOnInit() {
        this.api.topology().subscribe(
            (data: Object) => this.processTopology(data),
            (error: Object) => this.processError(error));

        this.refresh();
        this.id = setInterval(() => { this.refresh(); }, (this.refresh_interval * 1000));
    }

    ngOnDestroy() {
        if (this.id) {
            clearInterval(this.id);
        }
    }

    refresh() {
        if (this.refreshing) {
            return;
        }

        this.refreshing = true;

        this.api.stats().subscribe(
            (data) => this.processData(data),
            (error: Object) => this.processError(error)
        )
    }

    changeInterval() {
        if (this.refresh_interval < 0 && this.id) {
            clearInterval(this.id);
            this.refreshing = false;
            return;
        }

        if (this.id) {
            clearInterval(this.id)
        }

        this.id = setInterval(() => { this.refresh() }, this.refresh_interval*1000);
    }

    processTopology(data: any) {
        this.data = data;

        for (const idx in this.data) {
            if (this.data.hasOwnProperty(idx)) {
                this.data[idx][1]['outputs-avg'] = Array();
                for (const idx2 in this.data[idx][1]['outputs']) {
                    if (this.data[idx][1]['outputs'].hasOwnProperty(idx2)) {
                        this.data[idx][1]['outputs-avg'] = this.data[idx][1]['outputs-avg']
                            .concat(Object.assign(this.data[idx][1]['outputs'][idx2]))
                    }
                }
            }
        }
    }

    processData(data: any) {
        console.log(data);
        const time_diff: Number = Date.now() - this.last_refresh_time.getTime();
        this.last_refresh_time = new Date();

        const counters: Object = data['stats'];

        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                for (const module_idx in this.data) {
                    if (this.data.hasOwnProperty(module_idx) && this.data[module_idx][0] === key) {
                        const module_item = this.data[module_idx][1];

                        if (module_item['in_counter'] !== undefined) {
                            module_item['in_counter'] = (data[key]['INIFC0'] - module_item['INIFC0'])
                                / (Number(time_diff)/1000);
                        } else {
                            module_item['in_counter'] = 0;
                        }

                        for (const output_idx in module_item['outputs']) {
                            if (module_item['outputs'].hasOwnProperty(output_idx)) {
                                module_item['outputs-avg'][output_idx]['sent-msg-avg'] =
                                    (data[key]['outputs'][output_idx]['sent-msg']
                                    - module_item['outputs'][output_idx]['sent-msg'])
                                    / (Number(time_diff)/1000);
                                module_item['outputs-avg'][output_idx]['drop-msg-avg'] =
                                    (data[key]['outputs'][output_idx]['drop-msg']
                                     - module_item['outputs'][output_idx]['drop-msg'])
                                     / (Number(time_diff)/1000);
                            }
                        }

                        this.data[module_idx][1] = Object.assign(module_item, data[key]);
                    }
                }
            }
        }
        this.refreshing = false;
    }

    processError(error: Object) {
        if (error['status'] >= 404) {
            this.error = error;
        }
        console.log(error);
    }

    setDropClass(ifc: Object): string {
        if (ifc['drop-msg-avg'] === 0) {
            return('drop-rate-ok');
        } else if ((ifc['drop-msg-avg']/ifc['send-msg-avg']) < 0.001) {
            return('drop-rate-low');
        } else {
            return('drop-rate-high');
        }
    }
}
