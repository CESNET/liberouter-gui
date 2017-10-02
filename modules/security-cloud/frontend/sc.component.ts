import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { URLSearchParams } from '@angular/http';
import { SafeResourceUrl } from '@angular/platform-browser';

import { environment } from 'environments/environment';

@Component({
  selector : 'app-security-cloud',
  templateUrl : './sc.component.html',
  styleUrls : ['./sc.component.scss']
})
export class SecurityCloudComponent implements OnInit {

    baseUrl = 'https://';  // FTAS URL for iframe
    url: SafeResourceUrl;           // Sanitizied URL for iframe
    filter: string;                // Advanced filter field for FTAS
    iframeInit: Boolean = false;   // Flag for iframe initialization routine
    msg = '';              // The loading message
    eventTime: Date = new Date();
    beginTime: Date;
    endTime: Date;


    /**
      * Construct the FTAS URL from environment variables
      */
    constructor( private route: ActivatedRoute ) {
        /**
          * Environment can set full url of the FTAS instance
          */
        if (environment.securityCloud.fullUrl) {
            this.baseUrl = environment.securityCloud.fullUrl
        } else if (environment.securityCloud.url) {
            this.baseUrl += environment.securityCloud.url + 'index.php';
        } else {
            console.warn('Security Cloud URL isn\'t set.');
        }
    }

    /**
      * Get URL params and prepare the advanced query field for FTAS iframe
      */
    ngOnInit() {
        this.route.params.subscribe(params => {
            /**
              * Setup FTAS URL
              * If params are set we can do some filtering
              */
            if (params['eventtime'] === undefined) {
                this.url = this.baseUrl;
            } else {
                /**
                  * Get time of event
                  */
                console.log(+params['eventtime'] * 1000)
                this.eventTime = new Date(+params['eventtime'] * 1000);
                this.beginTime = new Date(+this.eventTime.getTime() - 12 * 60 * 60 * 1000);
                this.endTime = new Date(+this.eventTime.getTime() + 12 * 60 * 60 * 1000);

                this.url = this.baseUrl + '?'
                    + this.generateQueryBase()
                    + '&tbgn=' + Math.floor(this.beginTime.getTime() / 1000)
                    + '&tend=' + Math.floor(this.endTime.getTime() / 1000)
                    + '&start=' + Math.floor(this.eventTime.getTime() / 1000);
            }

        });
    }

    /**
      * Outputs loading message if iframe is loaded but not its contents
      * (load) fires two times: first time when iframe element is loaded
      * and second time when its content is loaded.
      */
    iframeLoaded() {
        if (!this.iframeInit) {
            this.msg = 'Security Cloud is loading...';
        } else {
            this.msg = '';
        }

        this.iframeInit = !this.iframeInit;
    }

    /**
      * Set filtering parameters base for FTAS
      * Filtering something in FTAS requires a lot of parameters to set.
      *
      * TODO: Reflect correctly time in "first" and "last" fields
      */
    private generateQueryBase(): URLSearchParams {
        const queryBase = new URLSearchParams();

        queryBase.set('tres', String(environment.securityCloud.resolution));

        return queryBase;

    }

}

