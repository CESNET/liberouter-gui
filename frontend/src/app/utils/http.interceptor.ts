/**
 * HTTP Interceptor class for liberouterapi backend communication
 *
 * The interceptor adds the Authorisation header with session ID (if present)
 * to every request and prefixes each request with API URL (if set)
 *
 * Author: Jakub Man <xmanja00@stud.fit.vutbr.cz>
 * Based on file by: Petr Stehlik <stehlik@cesnet.cz>
 * Date: 07/06/2018
 *
 * Frankly, I have no idea how backend works..
 */

import { Injectable, OnInit } from "@angular/core";
import {
    HttpInterceptor,
    HttpXhrBackend,
    HttpRequest,
    HttpHandler,
    HttpResponse,
    HttpErrorResponse, HttpEvent, HttpProgressEvent,
    HttpHeaders
} from "@angular/common/http";

import { Router } from "@angular/router";
import { AppConfigService } from "../services/app-config.service";
import { Observable } from "rxjs/Observable";
import { environment } from "../../environments/environment";

@Injectable()
export class RequestInterceptorService implements HttpInterceptor {
    private currentUser: Object;
    private prefixUrl: string;
    private api: Object = {};
    private appConfig: AppConfigService;
    private router: Router;

    constructor(router: Router, private _appConfig: AppConfigService) {
        this._appConfig.fetch().subscribe((data: string) =>
            this.api = data['api']
        );
        this.router = router;

    }

    addHeaders(request: HttpRequest<any>, options?: HttpHeaders): HttpRequest<any> {
        const url = this.buildUrl(request.url);


        let headers: HttpHeaders = RequestInterceptorService.buildHeaders(request.headers || new HttpHeaders());

        const newRequest: HttpRequest<any> = request.clone({
            url: url,
            headers: headers
        });

        console.log('headers added, sending now..');
        return newRequest;
    }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>{
        console.log('Intercepting request...');
        return next.handle(this.addHeaders(request))
            .catch(error => {
                if (error instanceof HttpErrorResponse) {
                    switch((<HttpErrorResponse>error).status) {
                        case 401:
                            this.handle401Error(error);
                            break;
                        case 442:
                            this.handle442Error(error);
                            break;

                    }
                }

                return Observable.throwError(error);

            });
    }

    /**
     * Unauthorised access, redirect to login
     */
    handle401Error(response: HttpErrorResponse) {
        console.warn('Unauthorised access');
        localStorage.removeItem('user');
        localStorage.removeItem('session');
        this.router.navigate(['/login']);
    }

    /**
     * Setup is required, redirect to setup
     */
    handle442Error(response: HttpErrorResponse) {
        this.router.navigate(['/setup']);
    }


    buildUrl(url: string): string {

        let urlString = '';

        urlString += this.api['proto'] || '';
        urlString += this.api['host'] || '';
        urlString += this.api['port'] ? ':' + this.api['port'] : '';
        urlString += this.api['url'] || environment.apiUrl || '';
        return urlString + url;
    }

    static buildHeaders(headers: HttpHeaders): HttpHeaders {
        const session : string = localStorage.getItem('session');
        if (session !== null) {
            console.log("Adding authorization headers");
            console.log(session);
            headers = headers.set('Authorization', session)
        }

        if (headers.has('specific-content-type')) {
            headers = headers.delete('specific-content-type');
        }
        else {
            headers = headers.set('Content-Type', 'application/json');
        }

        return headers;
    }
}
