import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response, URLSearchParams  } from '@angular/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class ScDbqryService {
    constructor (private http: Http) {
    }

    fields () {
        return this.http.get('/scgui/query/fields').map(
            (response: Response) => {
                return response.json();
            }
        ).catch(this.handleError);
    }

    queryStart(profilePath: string, instance: string, qFilter: string, qArgs: string, qChannels: string) {
        const body = {
            profile: profilePath,
            instanceID: instance,
            filter: qFilter,
            args: qArgs,
            channels: qChannels
        };

        return this.http.post('/scgui/query/instance', body).map(
            (response: Response) => {
                return response.json();
            }
        ).catch(this.handleError);
    }

    queryProgress(instance: string) {
        const params: URLSearchParams = new URLSearchParams();
        params.set('instanceID', instance);

        const requestOptions = new RequestOptions();
        requestOptions.search = params;

        return this.http.get('/scgui/query/progress', requestOptions).map(
            (response: Response) => {
                return response.json();
            }
        ).catch(this.handleError);
    }

    queryResult(instance: string) {
        const params: URLSearchParams = new URLSearchParams();
        params.set('instanceID', instance);

        const requestOptions = new RequestOptions();
        requestOptions.search = params;

        return this.http.get('/scgui/query/instance', requestOptions).map(
            (response: Response) => {
                return response.json();
            }
        ).catch(this.handleError);
    }

    queryKill(instance: string) {
        const params: URLSearchParams = new URLSearchParams();
        params.set('instanceID', instance);

        const requestOptions = new RequestOptions();
        requestOptions.search = params;

        return this.http.delete('/scgui/query/instance', requestOptions).map(
            (response: Response) => {
                return response.json();
            }
        ).catch(this.handleError);
    }

    private handleError(err: Response | any) {
        return Promise.reject(err);
    }
}
