import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class nStatService {
	constructor(private http : Http) {}

	stats() {
		return this.http.get('/virt/nemea/status/stats').map(
			(response : Response) => {
				let body : Object = response.json();
				return body;
			})
			.catch(this.handleError);
	}

	topology() {
		return this.http.get('/virt/nemea/status').map(
			(response : Response) => {
				let body = response.json();
				return body;
			})
			.catch(this.handleError);
	}

	private handleError(err : Response | any) {
		return Promise.reject(err);
	}
}
