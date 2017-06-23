import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response, URLSearchParams  } from '@angular/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class ScDbqryService {
    constructor (private http: Http) {
    }

    fields() {
        return this.http.get('/scgui/query/fields').map(
            (response: Response) => {
                return response.json();
            })
            .catch(this.handleError);
    }

    private handleError(err: Response | any) {
        return Promise.reject(err);
    }
}
