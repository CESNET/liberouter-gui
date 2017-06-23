// Global modules
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { URLSearchParams } from '@angular/http';
import { SafeResourceUrl } from '@angular/platform-browser';

import { environment } from 'environments/environment';

// Local modules
import { ProfileMap, Channel, ProfileLink } from './modules/Profile';
import { TimeSpecs, TimeSelection, TimeView } from './modules/TimeSpecs';

@Component({
    selector : 'app-security-cloud',
    templateUrl : './sc.component.html',
    styleUrls : ['./sc.component.scss']
})
export class SecurityCloudComponent implements OnInit {
    // TODO: Following variable will be initialized by a async request
    profiles: ProfileMap = new ProfileMap({
        'live': {
            name: 'live',
            type: 'normal',
            path: '/live',
            channels: [
                {
                    name: 'ch1',
                    filter: '*',
                    sources: ['*']
                },
                {
                    name: 'ch2',
                    filter: '*',
                    sources: ['*']
                }
            ],
            subprofiles: new ProfileMap({
                'test': {
                    name: 'test',
                    type: 'normal',
                    path: '/live/test',
                    channels: [
                        {
                            name: 'ch1',
                            filter: '*',
                            sources: [ 'ch1', 'ch2' ]
                        },
                        {
                            name: 'ch2',
                            filter: '*',
                            sources: [ 'ch2' ]
                        },
                    ],
                    subprofiles: new ProfileMap({})
                }
            })
        }
    });
    selectedProfile: string = null; ///< Identifier of currently selected profile(default: /live)
    linkList: ProfileLink[] = null;

    time: TimeSpecs = new TimeSpecs;
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
    timeUpdated = false;

    /**
      * Construct the FTAS URL from environment variables
      */
    constructor( private route: ActivatedRoute ) {}

    /**
      * Get URL params and prepare the advanced query field for FTAS iframe
      */
    ngOnInit() {
        /*this.route.params.subscribe(params => {
            if (params['eventtime'] == undefined)
                this.url = this.baseUrl;
            else {
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
        });*/

        const debug = true;
        if (debug) {
            const twelveHours: number = 12 * 60 * 60 * 1000;
            this.selectedProfile = '/live';
            this.time.view.bgn = 1486428000000;
            this.time.view.res = 1;
            this.time.view.end = this.time.view.bgn + twelveHours;
            this.time.sel.bgn = 1486428900000;
            this.time.sel.end = 1486429500000;
            this.linkList = this.profiles.getLinkList('');
        }
    }

    /**
     *  @brief Method for swapping profiles from dropdown menu
     */
    changeProfile(profilePath: string) {
        this.selectedProfile = profilePath;
    }
}

