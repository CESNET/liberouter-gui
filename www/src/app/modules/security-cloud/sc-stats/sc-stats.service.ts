import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response, URLSearchParams  } from '@angular/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class ScStatService {
    constructor (private http: Http) {
    }

    stats(bgn: number, end: number, profilePath: string) {
        const params: URLSearchParams = new URLSearchParams();
        params.set('bgn', String(Math.floor(bgn / 1000)));
        params.set('end', String(Math.floor(end / 1000)));
        params.set('profile', profilePath);

        const requestOptions = new RequestOptions();
        requestOptions.search = params;

        return this.http.get('/scgui/stats', requestOptions).map(
            (response: Response) => {
                return response.json();
            })
            .catch(this.handleError);
    }

    private handleError(err: Response | any) {
        return Promise.reject(err);
    }
}
