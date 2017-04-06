import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map'

@Injectable()
export class AuthService {

	constructor(private http: Http) { }

	login(username: string, password: string) {
		return this.http.post('/authorization',
			JSON.stringify({ username: username, password: password })
			)
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

    logout() {
		// remove user from local storage to log user out
		let user = JSON.parse(localStorage.getItem('currentUser'));
		console.log(user);
		return this.http.delete('/authorization')
			.map((response : Response) => {
				console.log(response);
			});
			//localStorage.removeItem('currentUser');

	}

	checkSession() {
		return this.http.get('/authorization').map(
			(response : Response) => {
				console.debug('Session is valid');
			})
			.catch(this.handleError);
	}

    admin(user : Object) {
        return this.http.post('/setup'
            , JSON.stringify(user))
            .map(
            (resp : Response) => {
                console.debug("Admin inserted");
            })
            .catch(this.handleError);
    }

	private handleError(err : Response | any) {
		return Promise.reject(err);
	}
}
