import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map'

@Injectable()
export class AuthService {

	headers = new Headers({ 'Content-Type': 'application/json' });
	options = new RequestOptions({ headers: this.headers });

	constructor(private http: Http) { }

	login(username: string, password: string) {
		return this.http.post('/api/authorization',
			JSON.stringify({ username: username, password: password }),
			this.options)
            .map((response: Response) => {
                // login successful
				let resp = response.json();

				if (resp && resp['error']) {
					console.error(resp['error']);
					return;
				}

				console.debug(resp)

				if (resp) {
                    // store user details and token in local storage to keep user logged in between page refreshes
                    localStorage.setItem('currentUser', JSON.stringify(resp));
                }
			})
			.catch(this.handleError);
    }

	handleError(err : Response | any) {
		return Promise.reject(err);
	}

    logout() {
		// remove user from local storage to log user out
		let user = JSON.parse(localStorage.getItem('currentUser'));
		console.log(user);
		this.headers.append('Authorization', user['session_id']);
		return this.http.delete('/api/authorization', {headers : this.headers})
			.map((response : Response) => {
				console.log(response);
			});
			//localStorage.removeItem('currentUser');

    }
}
