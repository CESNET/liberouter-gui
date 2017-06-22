import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { enableProdMode } from '@angular/core';
import { environment } from './environments/environment';

import { initApp } from './app/app.module';

if (environment.production) {
  enableProdMode();
}

/**
  * Retrieve config.json from a path specified in environment
  *
  * This cannot use the Angular HTTP module, therefore uses good old XMLHttpRequest
  */
export function main() {
    return new Promise((resolve, reject) => {
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
    });
}

// Fetch the config before bootstraping the app
main().then((data: string) => {
    platformBrowserDynamic().bootstrapModule(initApp(JSON.parse(data)));
});


