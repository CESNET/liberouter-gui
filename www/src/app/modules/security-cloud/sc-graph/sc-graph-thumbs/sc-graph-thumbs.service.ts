import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response, URLSearchParams  } from '@angular/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class ScThumbsService {
    constructor (private http: Http) {}

    thumb(bgn: number, end: number, profilePath: string, varname: string, points: number) {
        const params: URLSearchParams = new URLSearchParams();
        params.set('bgn', String(Math.floor(bgn / 1000)));
        params.set('end', String(Math.floor(end / 1000)));
        params.set('profile', profilePath);
        params.set('var', varname);
        params.set('points', String(points));
        params.set('mode', 'thumb');

        const requestOptions = new RequestOptions();
        requestOptions.search = params;

        return this.http.get('/scgui/graph', requestOptions).map(
            (response: Response) => {
                return response.json();
            })
            .catch(this.handleError);
    }

    private handleError(err: Response | any) {
        return Promise.reject(err);
    }
}
