import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Rx';
import { throwError } from 'rxjs';
import { environment } from 'environments/environment';
import { catchError } from "rxjs/operators";

@Injectable()
export class ConfigService {

    private config: Object = null;
    private baseUrl = '/configuration';

    constructor(protected http: HttpClient) {
    }

    /**
     * Load configuration of modules from the database.
     *
     * Note: The assets/config.json file is used only in the HTTP communication
     *      and therefore it is unnecessary anywhere else
     *
     */
    public load() {
        return new Promise((resolve, reject) => {
            this.http.get(this.baseUrl)
                .pipe(
                    catchError(ConfigService.handleLoadErr)
                );
        });
    }

    public getModule(name: string) {
        return this.http.get<any>(this.baseUrl + '/' + name)
            .pipe(
                catchError(ConfigService.handleError)
            );
    }

    public get() {
        return this.http.get(this.baseUrl)
            .pipe(
                catchError(ConfigService.handleError)
            );
    }

    public update(name: string, data: Object) {
        console.log(data);
        return this.http.put(this.baseUrl + '/' + name, data)
            .pipe(
                catchError(ConfigService.handleError)
            );
    }

    public add(data: Object) {
        return this.http.post(this.baseUrl, data)
            .pipe(
                catchError(ConfigService.handleError)
            );
    }

    public remove(name: string) {
        return this.http.delete(this.baseUrl + '/' + name)
            .pipe(
                catchError(ConfigService.handleError)
            );
    }

    private static handleError(err: Response | any) {
        return Promise.reject(err);
    }

    private static handleLoadErr(err: Response | any) {
        console.log(`Configuration could not be read`);
        //reject(true);
        return throwError(err.json().error || 'Server error');
    }
}
