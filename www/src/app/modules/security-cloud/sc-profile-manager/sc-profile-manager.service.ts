import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response, URLSearchParams  } from '@angular/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class ScProfileManagerService {
    constructor (private http: Http) {
    }

    get() {
        const params: URLSearchParams = new URLSearchParams();
        params.set('profile', 'all');

        const requestOptions = new RequestOptions();
        requestOptions.search = params;

        return this.http.get('/scgui/profiles', requestOptions).map(
            (response: Response) => {
                return response.json();
            }).catch(this.handleError);
    }

    create(parentPath: string, profileName: string, profileType: string, channelsStr: string) {
        const body = {
            profile: parentPath,
            pname: profileName,
            ptype: profileType,
            channels: channelsStr
        };

        return this.http.post('/scgui/profiles', body).map(
            (response: Response) => {
                return response.json();
            }).catch(this.handleError);
    }

    delete(profilePath: string) {
        const params: URLSearchParams = new URLSearchParams();
        params.set('profile', profilePath);

        const requestOptions = new RequestOptions();
        requestOptions.search = params;

        return this.http.delete('/scgui/profiles', requestOptions).map(
            (response: Response) => {
                return response.json();
            }).catch(this.handleError);
    }

    private handleError(err: Response | any) {
        return Promise.reject(err);
    }
}
