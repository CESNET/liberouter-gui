import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { NgbDateStruct, NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';
import { EventsService } from './events.service';

import { EventItemComponent } from './event-item/event-item.component';

@Component({
	selector: 'nemea-events',
	templateUrl: './events.component.html',
	styleUrls: ['./events.component.scss'],
	providers : [EventsService]
})
export class EventsComponent implements OnInit {

	events : any;
	remaining : Object = {
		total : -1
	}

	private now = new Date();

	query : Object;

	loadBtn = "LOAD";
	error;
	totalWhitelisted = 0;

	constructor(private eventsService : EventsService,
				private router : Router,
				private route : ActivatedRoute) { }

	ngOnInit() {
		this.reset();
		this.loadBtn = "LOADING...";

		this.route.queryParams.subscribe((params : Params) => {

			if (!Object.keys(params).length) {
				console.debug('should load default');

				this.eventsService.last_events(100).subscribe(
					(data) => {
						this.events = data;
						this.loadBtn = "LOAD";
						this.countWhitelisted();
					},
					(error : Object) => this.processError(error)
				);

			} else {
				console.debug('should load by params')
				console.log(params);

				for(let key in params) {
					console.log(key, params[key])
					try {
						this.query[key] = params[key];
					} catch (e) {
						console.log(e);
						continue;
					}
				}

			}
		});
	}

	private processData(data : any) {
		this.remaining = data.pop();
		this.events = data;
		this.loadBtn = "LOAD";
		//this.setParams();
		this.countWhitelisted();
	}

	private appendData(data : any) {
		this.remaining = data.pop();
		this.events = this.events.concat(data);
		this.loadBtn = "LOAD";
		//this.setParams();
		this.countWhitelisted();
	}


	private processError(error : Object) {
		console.log(error);
		this.error = error;
		this.loadBtn = "LOAD";
		this.setParams();
	}

	/**
	  * generate params to query and route, this includes navigating to same route which
	  * doesn't trigger reloading of the route
	  *
	  * The dates are kept in miliseconds since we are working in JS and only
	  * when going to the API they are floored to seconds
	  */
	private params() {
		console.log('setting params');

		let fromDate = new Date(this.query['date']['year'],
						   this.query['date']['month'],
						   this.query['date']['day'],
						   this.query['from']['hour'],
						   this.query['from']['minute']);

		let toDate = new Date(this.query['date']['year'],
						   this.query['date']['month'],
						   this.query['date']['day'],
						   this.query['to']['hour'],
						   this.query['to']['minute']);

		// Date is ommitted and will be deducted from the 'from' field
		return {
			from : fromDate.getTime(),
			to : toDate.getTime(),
			description : this.query['description'] || null,
			category : this.query['category'] || null,
			orderby : this.query['orderby'] || null,
			dir : this.query['dir'],
			limit : this.query['limit'],
			scrip : this.query['srcip'] || null,
			dstip : this.query['dstip'] || null
		}

	}

	/**
	  * Navigate to same route which doesn't trigger reloading of the route
	  */
	private setParams() {
		this.router.navigate(['nemea/events'], {queryParams : this.params()});
	}

	reset() {
		let now = new Date();
		this.query = {
			from : {
				hour: (now.getHours() - 1),
				minute: now.getMinutes()
			},
			to : {
				hour: now.getHours(),
				minute: now.getMinutes()
			},
			date : {
				year: now.getFullYear(),
				month: now.getMonth(),
				day: now.getDate()
			},
			description : "",
			category : "",
			orderby : "DetectTime",
			dir : -1,
			limit : 100,
			srcip : "",
			dstip : ""
		}
	}

	runQuery(append = false) {
		this.loadBtn = "LOADING...";

		let queryParams = this.params();
		console.log(queryParams)

		// Convert to unix timestamp (second)
		queryParams["to"] = Math.floor(queryParams["to"]/1000)
		queryParams["from"] = Math.floor(queryParams["from"]/1000)

		// Inital load of events and we need deeper history
		if (append) {
			queryParams['dir'] = (-1);
			queryParams['from'] = null;
		}

		console.log(queryParams);

		this.eventsService.query(queryParams).subscribe(
			(data) => {
			console.log(data[100]);
				if (append)
					this.appendData(data);
				else
					this.processData(data);
			},
			(error : Object) => this.processError(error));
	}

	getNext(time : number) {
		console.log("getnext")
		let date = new Date(time);
		this.query['date'] = {
				year: date.getFullYear(),
				month: date.getMonth(),
				day: date.getDate()
			}

		this.query['to']['hour'] = date.getHours();
		this.query['to']['minute'] = date.getMinutes();
		this.runQuery(true);
	}

	private countWhitelisted() {
	    for (let item of this.events) {
	        try {
	            if (item["_CESNET"]["Whitelisted"] == "True")
	                this.totalWhitelisted += 1;
            } catch(e) {
                continue;
            }
	    }
	}
}
