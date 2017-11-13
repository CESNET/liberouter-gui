import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs/Observable';

/**
 * Application configuration service
 *
 * Fetches app configuration from the server and makes it available through the application
 * Used for module en/disable feature and for HTTP interceptor
 */
@Injectable()
export class AppConfigService {

    private configPath: string = environment.configPath;
    private config;
    public obs;

    constructor() {
        this.fetch().subscribe((data : string) => {
            try {
                this.config = JSON.parse(data);
            } catch (e) {
                console.log("Error", e);
                let el = document.getElementById("error");
                el.innerText = "Failed to parse configuration file for front-end";
                return;
            }
        });
    }

    /**
     * Config getter
     */
    public get() {
        return this.config;
    }

    /**
     * Retrieve config.json from a path specified in environment
     *
     * This cannot use the Angular HTTP module, therefore uses good old XMLHttpRequest
     */
    public fetch() {
        return Observable.fromPromise(new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', environment.configPath);
            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(xhr.response);
                } else {
                    reject(xhr.statusText);
                }
            };
            xhr.onerror = () => reject(xhr.statusText);
            xhr.send();
        }));
    }
}
