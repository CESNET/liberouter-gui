/**
  * HTTP Interceptor class for liberouterapi backend communication
  *
  * The interceptor adds to every request the Authorization header with session
  * ID (if present) and prefixes each request with API URL (if set)
  *
  * Author: Petr Stehlik <stehlik@cesnet.cz>
  * Date: 15/06/2017
  */

import { Injectable } from '@angular/core';
import { Request,
    XHRBackend,
    RequestOptions,
    RequestOptionsArgs,
    RequestMethod,
    URLSearchParams,
    Response,
    Http,
    Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Router } from '@angular/router';
import { environment } from 'environments/environment';

import { AppConfigService } from 'app/services/app-config.service';

@Injectable()
export class HttpInterceptor extends Http {
    private currentUser: Object;
    private prefixUrl: string;
    private api: Object = {};

    constructor(backend: XHRBackend,
        defaultOptions: RequestOptions,
        private router: Router,
        private appconfig: AppConfigService
        ) {
        super(backend, defaultOptions);
        // Obtain config from app config service
        // We must fetch once more because Observables somehow don't work properly
        this.appconfig.fetch().subscribe((data: string) => {
            this.api = data['api'];
        });
    }

    /**
      * For each request add:
      *     - Authorization header if session is present
      *     - API URL prefix
      */
    request(url: Request,
        options?: RequestOptionsArgs): Observable<Response> {

        // Prefix the URL with environment prefix if set
        url.url = this.buildUrl(url.url);

        const session = localStorage.getItem('session');

        // Set Authorization header
        if (session !== null) {
            url.headers.set('Authorization', session);
        }

        // Set specific content type if "specific-content-type" header is set
        if (url.headers.has('specific-content-type')) {
            url.headers.delete('specific-content-type')
        } else {
            url.headers.set('Content-Type', 'application/json')
        }

        // Call the original Http
        if (!options) {
            return super.request(url).catch(this.catchErrors());
        } else {
            return super.request(url, options).catch(this.catchErrors());
        }
    }

    private catchErrors() {
        return (res: Response) => {
            if (res.status === 401) {
                console.warn('Unauthorized access, remove session and user and redirect to /login');
                localStorage.removeItem('user');
                localStorage.removeItem('session');
                this.router.navigate(['/login']);
            } else if (res.status === 442) {
                // SETUP is required
                // Maybe you ask why 442. Well, 42 is answer to everything, right?
                this.router.navigate(['/setup']);
            }
            return Observable.throw(res);
        };
    }

    /**
      * Create URL string for the request based on local configuration
      */
    private buildUrl(url: string) {
        let urlString = '';

        urlString += this.api['proto'] || '';
        urlString += this.api['host'] || '';
        urlString += this.api['port'] ? ':' + this.api['port'] : '';
        urlString += this.api['url'] || environment.apiUrl || '';
        return urlString + url;
    }

}
