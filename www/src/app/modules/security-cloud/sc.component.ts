import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { URLSearchParams } from '@angular/http';
import { SafeResourceUrl } from '@angular/platform-browser';
import { ProfileMap, Channel, ProfileLink } from './modules/Profile';
import { TimeSpecs, TimeSelection, TimeView } from './modules/TimeSpecs';

import { environment } from 'environments/environment';

@Component({
    selector : 'app-security-cloud',
    templateUrl : './sc.component.html',
    styleUrls : ['./sc.component.scss']
})
export class SecurityCloudComponent implements OnInit {
    baseUrl : string = "https://";  // FTAS URL for iframe
    url: SafeResourceUrl;           // Sanitizied URL for iframe
    filter : string;                // Advanced filter field for FTAS
    msg : string = "";              // The loading message
    eventTime : Date = new Date();
    beginTime : Date;
    endTime : Date;
    
    // TODO: Following variable will be initialized by a async request
    profiles : ProfileMap = new ProfileMap({
        "live" : {
            name: "live",
            type: "normal",
            path: "/live",
            channels: [
                {
                    name: "ch1",
                    filter: "*",
                    sources: ["*"]
                },
                {
                    name: "ch2",
                    filter: "*",
                    sources: ["*"]
                }
            ],
            subprofiles: new ProfileMap({
                "test": {
                    name: "test",
                    type: "normal",
                    path: "/live/test",
                    channels: [
                        {
                            name: "ch1",
                            filter: "*",
                            sources: [ "ch1", "ch2" ]
                        },
                        {
                            name: "ch2",
                            filter: "*",
                            sources: [ "ch2" ]
                        },
                    ],
                    subprofiles: new ProfileMap({})
                }
            })
        }
    });
    selectedProfile: string = null; ///< Identifier of currently selected profile(default: /live)
    linkList : ProfileLink[] = null;
    
    time : TimeSpecs = new TimeSpecs;
    /**
     *  Angular change detection only performs dirty checking. If reference to
     *  an object is passed to child component, all change checks will only
     *  perform identity (===) check on the object itself, not it's attributes.
     *  onChange lifecycle hook can be triggered via ChangeDetectorRef, but I
     *  need to pass variables in both directions and DetectorRef only provides
     *  way to propagate changes downwards the component tree.
     *  Because of that, following variable serves as a universal change 
     *  detection for the 'time' object across the component tree.
     */
    timeUpdated : boolean = false;
    
    /**
      * Construct the FTAS URL from environment variables
      */
    constructor( private route : ActivatedRoute ) {
        /**
          * Environment can set full url of the FTAS instance
          */
        if (environment.securityCloud.fullUrl) {
            this.baseUrl = environment.securityCloud.fullUrl
        } else if (environment.securityCloud.url) {
            this.baseUrl += environment.securityCloud.url + "index.php";
        } else {
            console.warn("Security Cloud URL isn't set.");
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
            if (params["eventtime"] == undefined)
                this.url = this.baseUrl;
            else {
                /**
                  * Get time of event
                  */
                console.log(+params["eventtime"] * 1000)
                this.eventTime = new Date(+params["eventtime"] * 1000);
                this.beginTime = new Date(+this.eventTime.getTime() - 12 * 60 * 60 * 1000);
                this.endTime = new Date(+this.eventTime.getTime() + 12 * 60 * 60 * 1000);

                this.url = this.baseUrl + '?'
                    + this.generateQueryBase()
                    + "&tbgn=" + Math.floor(this.beginTime.getTime() / 1000)
                    + "&tend=" + Math.floor(this.endTime.getTime() / 1000)
                    + "&start=" + Math.floor(this.eventTime.getTime() / 1000);
            }

            let debug : boolean = true;
            if (debug) {
                let twelveHours : number = 12 * 60 * 60 * 1000;
                this.selectedProfile = "/live";
                this.time.view.bgn = 1486428000000;
                this.time.view.res = 1;
                this.time.view.end = this.time.view.bgn + twelveHours;
                this.time.sel.bgn = 1486428900000;
                this.time.sel.end = 1486429500000;
                this.linkList = this.profiles.getLinkList('');
            }
        });
    }
    
    /**
      * Set filtering parameters base for FTAS
      * Filtering something in FTAS requires a lot of parameters to set.
      *
      * TODO: Reflect correctly time in "first" and "last" fields
      */
    private generateQueryBase() : URLSearchParams {
        let queryBase = new URLSearchParams();

        queryBase.set("tres", String(environment.securityCloud.resolution));

        return queryBase;

    }
}

