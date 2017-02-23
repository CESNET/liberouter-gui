import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class EventsService {
	constructor(private http : Http) {}

	last_events(items : number) {
		return this.http.get('/nemea/events/' + String(items)).map(
			(response : Response) => {
				console.log(response);
				let body : Object = response.json();
				return body;
			})
			.catch(this.handleError);
	}

	query(query : Object) {
		let params: URLSearchParams = new URLSearchParams();
		for(let key in query) {
			params.set(key.toString(), query[key]);
		}
		return this.http.get('/nemea/events/query', {search : params}).map(
			(response : Response) => {
				console.log(response);
				let body = response.json();
				return body;
			})
			.catch(this.handleError);
	}

	private handleError(err : Response | any) {
		return Promise.reject(err);
	}
}
