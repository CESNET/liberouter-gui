import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { EventsService } from './events.service';

import { EventItemComponent } from './event-item/event-item.component';

const now = new Date();

@Component({
	selector: 'nemea-events',
	templateUrl: './events.component.html',
	styleUrls: ['./events.component.scss'],
	providers : [EventsService]
})
export class EventsComponent implements OnInit {

	events : Array<Object>;
	remaining : Object = {total : (-1)};
	query : Object = {
        from : "12:00",
        to : "",
		date : {
			year: now.getFullYear(),
			month: now.getMonth() + 1,
			day: now.getDate()
		},
        description : "",
        category : "",
        orderby : "DetectTime",
        dir : 1,
        limit : 100,
        srcip : "",
        dstip : ""
	}
	loadBtn = "LOAD";
	error;

	constructor(private eventsService : EventsService, private router : Router) { }

	ngOnInit() {
		this.loadBtn = "LOADING...";
		this.eventsService.last_events(100).subscribe(
			(data) => { this.events = data; this.loadBtn = "LOAD" },
			(error : Object) => this.processError(error)
		);
		this.selectToday();
	}

	private processData(data : any) {
		this.remaining = data.pop();
		this.events = data;
		this.loadBtn = "LOAD";
		this.setParams();
	}

	private appendData(data : any) {
		this.remaining = data.pop();
		this.events = this.events.concat(data);
		this.loadBtn = "LOAD";
		this.setParams();
	}


	private processError(error : Object) {
		console.log(error);
		this.error = error;
		this.loadBtn = "LOAD";
		this.setParams();
	}

	private setParams() {
		console.log('setting params');
		this.router.navigate(['nemea/events'], {queryParams : this.query});
	}

	selectToday() {
		this.query['date'] = {year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate()};
	}

	reset() {
		this.query = {
			from : "12:00",
			to : "",
			date : {
				year: now.getFullYear(),
				month: now.getMonth() + 1,
				day: now.getDate()
			},
			description : "",
			category : "",
			orderby : "DetectTime",
			dir : 1,
			limit : 100,
			srcip : "",
			dstip : ""
		}
	}

	private parseHours(time : any) : number {
		if ((typeof time == "number" && time > 0) || time == undefined)
			return time;

		if (typeof time == "string" && time == "")
			return Math.floor(Date.now() / 1000);

		let sTime = time.split(':');
		let hours = new Date(this.query['date']['year'],
			this.query['date']['month'] - 1 ,this.query['date']['day']);
		hours.setHours(Number(sTime[0]));
		hours.setMinutes(Number(sTime[1]));

		return Math.floor(hours.getTime() / 1000);
	}

	runQuery(append = false) {
		this.loadBtn = "LOADING...";

		let queryParams = {
			from : this.parseHours(this.query['from']),
			to : this.parseHours(this.query['to']),
			limit : this.query['limit'],
			dir : this.query['dir'],
			orderby : this.query['orderby']
		}

		// Inital load of events and we need deeper history
		if (this.remaining['total'] == -1 && append) {
			this.query['to'] = this.query['from'];
			this.query['from'] = undefined;
			queryParams['dir'] = (-1);
		}

		console.log(queryParams);

		this.eventsService.query(queryParams).subscribe(
			(data) => {
				if (append)
					this.appendData(data);
				else
					this.processData(data);
			},
			(error : Object) => this.processError(error));
	}

	getNext(time : number) {
		console.info(time);
		this.query['from'] = Math.floor((time)/1000);
		this.runQuery(true);
	}
}
