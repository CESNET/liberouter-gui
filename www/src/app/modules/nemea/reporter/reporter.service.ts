import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class ReporterService {

    constructor(private http : Http) { }

    get() {
        return this.http.get('/nemea/reporters/config').map(
            (response : Response) => {
                return response.json();
            })
            .catch(this.handleError);
    }

    update(data : Object) {
		return this.http.put('/nemea/reporters/config', data).map(
			(response : Response) => {
				return response.json();
			})
			.catch(this.handleError)
    }


    save(idx : number, conf : string) {
        if (idx < 0)
            throw "Index not set";

        if (conf == '')
            throw "Configuration is empty"

        console.log(idx);
        console.log(conf);
    }

    private handleError(err : Response | any) {
        return Promise.reject(err);
    }

}
