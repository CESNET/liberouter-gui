import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response, URLSearchParams  } from '@angular/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class ScDbqryIplookupService {
    constructor (private http: Http) {
    }

    lookup (ipaddr: string) {
        const params: URLSearchParams = new URLSearchParams();
        params.set('ip', ipaddr);

        const requestOptions = new RequestOptions();
        requestOptions.search = params;

        return this.http.get('/scgui/query/lookup', requestOptions).map(
            (response: Response) => {
                return response.json();
            }
        ).catch(this.handleError);
    }

    private handleError(err: Response | any) {
        return Promise.reject(err);
    }
}
