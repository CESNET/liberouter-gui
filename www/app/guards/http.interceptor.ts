import { Injectable } from '@angular/core';
import { Request,
	XHRBackend,
	RequestOptions,
	RequestOptionsArgs,
	URLSearchParams,
	Response,
	Http,
	Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Router } from '@angular/router';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';

@Injectable()
export class HttpInterceptor extends Http {
	currentUser : Object;
	headers : Headers = new Headers({ 'Content-Type': 'application/json' });

	constructor(backend: XHRBackend,
		defaultOptions: RequestOptions,
		private router: Router
		//private authService: AuthService
		)
	{
		super(backend, defaultOptions);
	}

	// During each request append Authorization header if session is present
	request(url: Request,
		options?: RequestOptionsArgs): Observable<Response>
	{
		this.currentUser = this.getCurrentUser();

		if (this.currentUser != undefined) {
			this.headers.set('Authorization', this.currentUser['session_id']);
			}

			console.log(url)

			if (!options) {
				url.headers = this.headers;
				return super.request(url).catch(this.catchErrors());
			}

				console.log(options);
		//options.headers = this.headers;
		//console.log(options);


		// Call the original Http
		return super.request(url, options).catch(this.catchErrors());
	}

	private catchErrors() {
		return (res : Response) => {
			if (res.status == 401) {
				console.debug('Cought 401, logging out!')
				this.router.navigate(['logout']);
			}
			return Observable.throw(res);
		};
	}

	private getCurrentUser() : Object {
		return JSON.parse(localStorage.getItem('currentUser'));
	}
}
