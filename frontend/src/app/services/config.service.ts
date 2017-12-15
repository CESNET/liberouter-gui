import { Inject, Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { environment } from 'environments/environment';

@Injectable()
export class ConfigService {

    private config: Object = null;
    private baseUrl = '/configuration';

    constructor(private http: Http) {}

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
                .map( res => res.json() )
                .catch((error: any): any => {
                    console.log(`Configuration could not be read`);
                    reject(true);
                    return Observable.throw(error.json().error || 'Server error');
                })
                .subscribe( (response) => {
                    this.config = response;
                    console.log(this.config)
                    resolve(true);
                });
        });
    }

    public getModule(name: string) {
        return this.http.get(this.baseUrl + '/' + name)
            .map( res => res.json())
            .catch(this.handleError);
    }

    public get() {
        return this.http.get(this.baseUrl)
            .map( res => res.json())
            .catch(this.handleError);
    }

    public update(name: string, data: Object) {
        console.log(data);
        return this.http.put(this.baseUrl + '/' + name, data)
            .map( res => res.json())
            .catch(this.handleError);
    }

    public add(data: Object) {
        return this.http.post(this.baseUrl, data)
            .map( res => res.json())
            .catch(this.handleError);
    }

    public remove(name: string) {
        return this.http.delete(this.baseUrl + '/' + name)
            .map( res => res.json())
            .catch(this.handleError);
    }

    private handleError(err: Response | any) {
        return Promise.reject(err);
    }
}
