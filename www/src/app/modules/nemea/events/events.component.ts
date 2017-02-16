import { Component, OnInit } from '@angular/core';
import { EventsService } from './events.service';

@Component({
	selector: 'nemea-events',
	templateUrl: './events.component.html',
	styleUrls: ['./events.component.scss'],
	providers : [EventsService]
})
export class EventsComponent implements OnInit {

	events : Array<Object>;

	constructor(private eventsService : EventsService) { }

	ngOnInit() {
		this.eventsService.last_events(10).subscribe(
			(data) => this.processData(data),
			(error : Object) => this.processError(error)
		);
	}

	private processData(data : any) {
		this.events = data;
	}

	private processError(error : Object) {
		console.log(error);
	}
}
