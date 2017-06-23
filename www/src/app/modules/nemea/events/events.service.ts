import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class EventsService {
    constructor(private http: Http) {}

    last_events(items: number) {
        return this.http.get('/nemea/events/' + String(items)).map(
            (response: Response) => {
                const body: Object = response.json();
                return body;
            })
            .catch(this.handleError);
    }

    query(query: Object) {
        const params: URLSearchParams = new URLSearchParams();
        for (const key in query) {
            if (query.hasOwnProperty(key)) {
                params.set(key.toString(), query[key]);
            }
        }
        return this.http.get('/nemea/events/query', {search : params}).map(
            (response: Response) => {
                const body = response.json();
                return body;
            })
            .catch(this.handleError);
    }

    private handleError(err: Response | any) {
        return Promise.reject(err);
    }
}
