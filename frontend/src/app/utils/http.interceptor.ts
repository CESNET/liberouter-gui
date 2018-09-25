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
import { throwError } from 'rxjs';
import { environment } from "../../environments/environment";

@Injectable()
export class RequestInterceptorService implements HttpInterceptor {
    private api: Object = {};
    private router: Router;

    constructor(router: Router, private _appConfig: AppConfigService) {
        this._appConfig.fetch().subscribe((data: string) =>
            this.api = data['api']
        );
        this.router = router;

    }

    addHeaders(request: HttpRequest<any>, options?: HttpHeaders): HttpRequest<any> {
        //Build new url
        const url = this.buildUrl(request.url);
        //Build new headers. If headers were empty, create new headers.
        let headers: HttpHeaders = RequestInterceptorService.buildHeaders(request.headers || new HttpHeaders());

        return request.clone({
            url: url,
            headers: headers
        });
    }

    /**
     * Angular Interceptor implementation.
     */
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
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

                return throwError(error);

            });
    }

    /**
     * Unauthorised access, redirect to login
     */
    handle401Error(response: HttpErrorResponse) {
        console.warn('Unauthorised access');
        localStorage.removeItem('user');
        localStorage.removeItem('session_id');
        this.router.navigate(['/login']);
    }

    /**
     * No users were found, setup is required.
     * See backend docs for more info.
     */
    handle442Error(response: HttpErrorResponse) {
        this.router.navigate(['/setup']);
    }

    /**
     * Builds new url from API config.
     * Reads config from path specified in environment.ts
     */
    buildUrl(url: string): string {

        let urlString = '';

        urlString += this.api['proto'] || '';
        urlString += this.api['host'] || '';
        urlString += this.api['port'] ? ':' + this.api['port'] : '';
        urlString += this.api['url'] || environment.apiUrl || '';
        return urlString + url;
    }

    /**
     * Builds new headers for http requests.
     * Headers in HttpRequests are read-only, so we need to create new headers and create a new request.
     */
    static buildHeaders(headers: HttpHeaders): HttpHeaders {
        //Get session ID from localstorage
        const session : string = localStorage.getItem('session_id');
        //We found session ID, send it to server
        if (session !== null) {
            headers = headers.set('lgui-Authorization', session)
        }
        //Remove specific content types to prevent errors
        if (headers.has('specific-content-type')) {
            headers = headers.delete('specific-content-type');
        }
        //Add default json content type
        else {
            headers = headers.set('Content-Type', 'application/json');
        }

        return headers;
    }
}
