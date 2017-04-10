import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { URLSearchParams } from '@angular/http';
import { SafeResourceUrl } from '@angular/platform-browser';

import { environment } from 'environments/environment';


@Component({
  selector : 'app-nerd',
  templateUrl : './nerd.component.html',
  styleUrls : ['./nerd.component.scss']
})
export class NerdComponent implements OnInit {

    baseUrl : string = "https://";  // FTAS URL for iframe
    url: SafeResourceUrl;           // Sanitizied URL for iframe
    filter : string;                // Advanced filter field for FTAS
    iframeInit : Boolean = false;   // Flag for iframe initialization routine
    msg : string = "";          // The loading message

    /**
      * Construct the FTAS URL from environment variables
      */
    constructor( private route : ActivatedRoute ) {
        /**
          * Environment can set full url of the FTAS instance
          */
        if (environment.nerd.fullUrl) {
            this.baseUrl = environment.nerd.fullUrl
        } else if (environment.nerd.url) {
            this.baseUrl += environment.nerd.url;
        } else {
            console.warn("NERD URL isn't set.");
        }
    }

    /**
      * Get URL params and prepare the advanced query field for FTAS iframe
      */
    ngOnInit() {
        this.route.params.subscribe(params => {
            /**
              * Setup NERD URL
              * If params are set we can do some filtering
              */
            if (params["ip"] == undefined)
                this.url = this.baseUrl;
            else {
                this.url = this.baseUrl + "/ip/" + params["ip"];
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
            this.msg = "NERD is loading...";
        } else {
            this.msg = "";
        }

        this.iframeInit = !this.iframeInit;
    }
}
