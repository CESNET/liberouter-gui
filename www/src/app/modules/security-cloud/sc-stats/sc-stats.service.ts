import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response, URLSearchParams  } from '@angular/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class scStatService {
	constructor (private http: Http) {
	}
	
	stats(bgn : number, end : number, profilePath : string) {
		let params: URLSearchParams = new URLSearchParams();
		params.set('bgn', String(Math.floor(bgn / 1000)));
		params.set('end', String(Math.floor(end / 1000)));
		params.set('profile', profilePath);
		
		let requestOptions = new RequestOptions();
		requestOptions.search = params;
		
		return this.http.get('/scgui/stats', requestOptions).map(
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