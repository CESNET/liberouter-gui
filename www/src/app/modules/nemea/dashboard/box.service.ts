import { Injectable } from '@angular/core';
import { Http, RequestOptions, Response, URLSearchParams } from '@angular/http';

@Injectable()
export class BoxService {

    constructor(private http: Http) {}

    piechart(box) {
        const requestOptions = new RequestOptions();

        const params: URLSearchParams = new URLSearchParams();

        /**
          * Set time window
          * The difference in capitalization is because of backward compatibility
          */
        params.set('begintime', box['beginTime']);
        params.set('endtime', box['endTime']);

        params.set('metric', box['metric']);
        params.set('type', 'piechart');

        requestOptions.search = params;

        return this.http.get('/nemea/events/aggregate', requestOptions).map(
            (response: Response) => {
                const body = response.json()
                return body;
            })
            .catch(this.handleError);
    }

    barchart(box) {
        const requestOptions = new RequestOptions();

        const params: URLSearchParams = new URLSearchParams();

        /**
          * Set time window
          * The difference in capitalization is because of backward compatibility
          */
        params.set('begintime', box['beginTime']);
        params.set('endtime', box['endTime']);

        params.set('window', box['window'] ? box['window'] : 60);
        params.set('type', 'barchart');

        requestOptions.search = params;

        return this.http.get('/nemea/events/aggregate', requestOptions).map(
            (response: Response) => {
                const body = response.json()
                return body;
            })
            .catch(this.handleError);
    }

    count(box) {
        const requestOptions = new RequestOptions();
        const params: URLSearchParams = new URLSearchParams();

        params.set('begintime', box['beginTime']);
        params.set('endtime', box['endTime']);
        params.set('category', 'any');

        requestOptions.search = params;

        return this.http.get('/nemea/events/count', requestOptions).map(
            (response: Response) => {
                const body = response.json()
                return body;
            })
            .catch(this.handleError);
    }

    top(box) {
        const requestOptions = new RequestOptions();
        const params: URLSearchParams = new URLSearchParams();

        params.set('begintime', box['beginTime']);
        params.set('endtime', box['endTime']);

        requestOptions.search = params;

        return this.http.get('/nemea/events/top', requestOptions).map(
            (response: Response) => {
                const body = response.json()
                return body;
            })
            .catch(this.handleError);
    }


    private handleError(err: Response | any) {
        return Promise.reject(err);
    }
}
