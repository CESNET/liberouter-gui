import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs';
import { from } from 'rxjs';

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
    public auth: boolean;

    constructor() {
        let data = localStorage.getItem('auth');
        if (!data || data == "true") {
            this.auth = true;
        } else {
            this.auth = false;
        }
        this.obs = this.fetch().subscribe((data: string) => {
            try {
                this.config = data;
            } catch (e) {
                console.log('Error', e);
                const el = document.getElementById('error');
                el.innerText = 'Failed to parse configuration file for front-end';
                return;
            }
        });
    }

    /**
     * Config getter
     */
    public get() {
        if (this.config) {
            return of(this.config);
        } else {
            return this.fetch();
        }
    }

    public set(config) {
        this.config = config;
    }

    /**
     * Retrieve config.json from a path specified in environment
     *
     * This cannot use the Angular HTTP module, therefore uses good old XMLHttpRequest
     */
    public fetch() {
        return from(new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', environment.configPath);
            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(JSON.parse(xhr.response));
                } else {
                    reject(xhr.statusText);
                }
            };
            xhr.onerror = () => reject(xhr.statusText);
            xhr.send();
        }));
    }
}
