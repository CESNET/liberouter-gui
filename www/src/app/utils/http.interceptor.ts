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
import { environment } from 'environments/environment';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';

@Injectable()
export class HttpInterceptor extends Http {
	currentUser : Object;
	headers : Headers = new Headers({ 'Content-Type': 'application/json' });
	prefixUrl : string = environment.apiUrl;

	constructor(backend: XHRBackend,
		defaultOptions: RequestOptions,
		private router: Router
		//private authService: AuthService
		)
	{
		super(backend, defaultOptions);
		this.prefixUrl = environment.apiUrl;
	}

	// During each request append Authorization header if session is present
	request(url: Request,
		options?: RequestOptionsArgs): Observable<Response>
	{
		// Prefix the URL with environment prefix
		url.url = this.prefixUrl + url.url;
		this.currentUser = this.getCurrentUser();

		if (this.currentUser != undefined) {
			this.headers.set('Authorization', this.currentUser['session_id']);
		}

		url.headers = this.headers;

		if (!options) {
			url.headers = this.headers;
			return super.request(url).catch(this.catchErrors());
		}

		// Call the original Http
		return super.request(url, options).catch(this.catchErrors());
	}

	private catchErrors() {
		return (res : Response) => {
			if (res.status == 401) {
				console.debug('Caught 401, logging out!')
				localStorage.removeItem("currentUser");
				this.router.navigate(['/login']);
			}

			// SETUP is required
			// Maybe you ask why 442. Well, 42 is answer to everything, right?
			else if (res.status == 442) {
				console.debug("Setup is required. Redirecting to /setup");
				this.router.navigate(['/setup']);
			}
			return Observable.throw(res);
		};
	}

	private getCurrentUser() : Object {
		return JSON.parse(localStorage.getItem('currentUser'));
	}
}
