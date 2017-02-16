import { Component, Pipe, PipeTransform } from '@angular/core';
import { nStatService } from './nemea_status.service';

@Component({
	//moduleId : module.id.replace("/dist/", "/"),
	selector : 'nemea-status',
	templateUrl : './nemea_status.html',
	styleUrls : ['./nemea_status.css'],
	providers : [nStatService]
})
export class nemeaStatusComponent {
	error : String = ""
	refreshing : Boolean = false;
	last_refresh_time : Date = new Date();
	img_path : any;
	data : Object;
	id : any;

	// Refresh interval in seconds
	refresh_interval : number = 5;

	constructor(private api : nStatService) {}

	ngOnInit() {
		this.api.topology().subscribe(
			(data : Object) => this.processTopology(data),
			(error : Object) => this.processError(error));

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
			console.info('Still refreshing')
			return;
		}

		this.refreshing = true;

		this.api.stats().subscribe(
			(data) => this.processData(data),
			(error : Object) => this.processError(error)
		)
	}

	changeInterval() {
		if (this.id) {
			clearInterval(this.id)
		}

		this.id = setInterval(() => { this.refresh() }, this.refresh_interval);
	}

	processTopology(data : any) {
		console.log(data);
		this.data = data;

		for (var idx in this.data) {
			this.data[idx][1]['outputs-avg'] = Array();
			for (var idx2 in this.data[idx][1]['outputs']) {
			this.data[idx][1]['outputs-avg'] = this.data[idx][1]['outputs-avg'].concat(Object.assign(this.data[idx][1]['outputs'][idx2]))
			}
		}
	}

	processData(data : any) {
		console.log(data);
		//this.data = data;
		let time_diff : Number = Date.now() - this.last_refresh_time.getTime();
		this.last_refresh_time = new Date();

		let counters : Object = data['stats'];

		for (var key in data) {
			for (var module_idx in this.data) {
				if (this.data[module_idx][0] == key) {

					let module_item = this.data[module_idx][1];

					if (module_item['in_counter'] != undefined) {
						module_item['in_counter'] = (data[key]['INIFC0'] - module_item['INIFC0']) / (Number(time_diff)/1000);
					} else {
						module_item['in_counter'] = 0;
						}

					//console.log(module_item)
					for (var output_idx in module_item['outputs']) {
						module_item['outputs-avg'][output_idx]['sent-msg-avg'] = (data[key]['outputs'][output_idx]['sent-msg'] - module_item['outputs'][output_idx]['sent-msg']) / (Number(time_diff)/1000);
						module_item['outputs-avg'][output_idx]['drop-msg-avg'] = (data[key]['outputs'][output_idx]['drop-msg'] - module_item['outputs'][output_idx]['drop-msg']) / (Number(time_diff)/1000);

					}
					this.data[module_idx][1] = Object.assign(module_item, data[key]);
				}
			}
		}
		this.refreshing = false;
	}

	processError(error : Object) {
		console.log(error);
	}

	setDropClass(ifc : Object) : string {
		if (ifc['drop-msg-avg'] == 0) {
			return('drop-rate-ok');
		} else if ((ifc['drop-msg-avg']/ifc['send-msg-avg']) < 0.001) {
			return('drop-rate-low');
		} else {
			return('drop-rate-high');
		}
	}
}
