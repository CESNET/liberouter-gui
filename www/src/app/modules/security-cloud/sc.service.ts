import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response, URLSearchParams  } from '@angular/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class ScService {
    constructor (private http: Http) {
    }

    profiles() {
        const params: URLSearchParams = new URLSearchParams();
        params.set('profile', 'all');

        const requestOptions = new RequestOptions();
        requestOptions.search = params;

        return this.http.get('/scgui/profiles', requestOptions).map(
            (response: Response) => {
                return response.json();
            }).catch(this.handleError);
    }

    config() {
        return this.http.get('/scgui/config').map(
            (response: Response) => {
                return response.json();
            }).catch(this.handleError);
    }

    private handleError(err: Response | any) {
        return Promise.reject(err);
    }
}
