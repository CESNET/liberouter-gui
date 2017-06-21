import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response, URLSearchParams  } from '@angular/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class scGraphService {
	constructor (private http: Http) {
	}
	
	graph(bgn : number, end : number, profilePath : string, varname : string, points : number) {
		let params: URLSearchParams = new URLSearchParams();
		params.set('bgn', String(Math.floor(bgn / 1000)));
		params.set('end', String(Math.floor(end / 1000)));
		params.set('profile', profilePath);
		params.set('var', varname);
		params.set('points', String(points));
		
		let requestOptions = new RequestOptions();
		requestOptions.search = params;
		
		return this.http.get('/scgui/graph', requestOptions).map(
			(response : Response) => {
				let body : Object = response.json();
				return body;
			})
			.catch(this.handleError);
	}
	
	private handleError(err : Response | any) {
		return Promise.reject(err);
	}
}