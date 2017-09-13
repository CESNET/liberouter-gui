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
                const resp = response.json();

                if (resp && resp['error']) {
                    console.error(resp['error']);
                    return;
                }

                if (resp) {
                    // store user details and token in local storage to keep user logged in between page refreshes
                    localStorage.setItem('currentUser', JSON.stringify(resp));
                }
            })
            .catch(this.handleError);
    }

    logout() {
        // remove user from local storage to log user out
        const user = JSON.parse(localStorage.getItem('currentUser'));
        console.log(user);
        return this.http.delete('/authorization')
            .map((response: Response) => {});

    }

    checkSession() {
        return this.http.get('/authorization').map(
            (response: Response) => {})
            .catch(this.handleError);
    }

    admin(user: Object) {
        return this.http.post('/setup'
            , JSON.stringify(user))
            .map(
            (resp: Response) => {})
            .catch(this.handleError);
    }

    private handleError(err: Response | any) {
        return Promise.reject(err);
    }
}
