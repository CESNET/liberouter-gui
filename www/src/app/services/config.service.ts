import { Inject, Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Rx';
import { environment } from 'environments/environment';

@Injectable()
export class ConfigService {

    private config: Object = null;

    constructor(private http: Http) {}

    /**
     * Use to get the data found in the second file (config file)
     */
    public get(key: any = null) {
    	console.log(this.config);
    	if (key != null)
			return this.config[key];
		else
			return this.config;
    }

    /**
     * Load configuration of modules from the database.
     *
     * Note: The assets/config.json file is used only in the HTTP communication
     *		and therefore it is unnecessary anywhere else
     *
     */
    public load() {
        return new Promise((resolve, reject) => {
            this.http.get("/configuration")
				.map( res => res.json() )
            	.catch((error: any):any => {
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
}
