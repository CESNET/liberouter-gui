import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Rx';
import { environment } from 'environments/environment';

@Injectable()
export class ConfigService {

    private config: Object = null;
    private baseUrl = '/configuration';

    constructor(protected http: HttpClient) {}

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
                .catch((error: any): any => {
                    console.log(`Configuration could not be read`);
                    reject(true);
                    return Observable.throwError(error.json().error || 'Server error');
                })
        });
    }

    public getModule(name: string) {
        return this.http.get<any>(this.baseUrl + '/' + name)
            .catch(ConfigService.handleError);
    }

    public get() {
        return this.http.get(this.baseUrl)
            .catch(ConfigService.handleError);
    }

    public update(name: string, data: Object) {
        console.log(data);
        return this.http.put(this.baseUrl + '/' + name, data)
            .catch(ConfigService.handleError);
    }

    public add(data: Object) {
        return this.http.post(this.baseUrl, data)
            .catch(ConfigService.handleError);
    }

    public remove(name: string) {
        return this.http.delete(this.baseUrl + '/' + name)
            .catch(ConfigService.handleError);
    }

    private static handleError(err: Response | any) {
        return Promise.reject(err);
    }
}
