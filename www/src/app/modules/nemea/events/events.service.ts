import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class EventsService {
	constructor(private http : Http) {}

	last_events(items : number) {
		return this.http.get('/api/nemea/events/' + String(items)).map(
			(response : Response) => {
				console.log(response);
				let body : Object = response.json();
				return body;
			})
			.catch(this.handleError);
	}

	private handleError(err : Response | any) {
		return Promise.reject(err);
	}
}
