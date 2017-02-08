import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map'

@Injectable()
export class UsersService {

	constructor(private http: Http) { }

	add(user : Object) {
		return this.http.post('/api/users', user)
            .map((response: Response) => {
				// User successfully added
				// Extract data from response
				let body : Object = response.json();

				console.log(body)
				return body;
			})
			.catch(this.handleError);
	}

	remove(id : string) {
		return this.http.delete('/api/users/' + id)
			.map((response: Response) => {
				// User successfully added
				// Extract data from response
				let body : Object = response.json();

				console.log(body)
				return body;
			})
			.catch(this.handleError);
	}

	list() {
		return this.http.get('/api/users')
			.map((response : Response) => response.json())
			.catch(this.handleError);
	}

	handleError(err : Response | any) {
		return Promise.reject(err);
	}

}

