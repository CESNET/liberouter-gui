// Global modules
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { URLSearchParams } from '@angular/http';
import { SafeResourceUrl } from '@angular/platform-browser';

import { environment } from 'environments/environment';

// Local modules
import { ProfileMap, Channel, ProfileLink } from './modules/Profile';
import { TimeSpecs, TimeSelection, TimeView } from './modules/TimeSpecs';
import { AppConfig } from './modules/AppConfig';

// Service
import { ScService } from './sc.service';

@Component({
    selector : 'app-security-cloud',
    templateUrl : './sc.component.html',
    styleUrls : ['./sc.component.scss'],
    providers : [ScService]
})
export class SecurityCloudComponent implements OnInit {
    profiles: ProfileMap = null;
    config: AppConfig = null;
    selectedProfile: string = null; ///< Identifier of currently selected profile(default: /live)
    linkList: ProfileLink[] = null;
    error: any = null;

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
    constructor( private route: ActivatedRoute, private api: ScService ) {}

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

        this.getProfilesData();
        this.getConfigData();

        this.selectedProfile = '/live';
    }

    getProfilesData() {
        this.api.profiles().subscribe(
            (data: Object) => this.processProfilesData(data),
            (error: Object) => this.processError(error)
        );
    }

    getConfigData() {
        this.api.config().subscribe(
            (data: Object) => this.processAppConfigData(data),
            (error: Object) => this.processError(error)
        );
    }

    /**
     *  @brief Handle for processing incoming Profiles data
     */
    processProfilesData(data: any) {
        this.profiles = new ProfileMap(data);

        this.linkList = this.profiles.getLinkList('');
    }

    /**
     *  @brief Handle for processing incoming AppConfig data
     */
    processAppConfigData(data: any) {
        this.config = data;
    }

    /**
     *  @brief Handle for processing async request errors
     */
    processError(error: any) {
        if (error['status'] >= 404) {
            this.error = error;
        }

        console.error('Error when retrieving graph:');
        console.error(error);
    }

    /**
     *  @brief Method for handling time change propagated from graph component
     */
    handleTimeChangePropagation(event: any) {
        this.timeUpdated = !this.timeUpdated;
    }

    /**
     *  @brief Method for swapping profiles from dropdown menu
     */
    changeProfile(profilePath: string) {
        this.selectedProfile = profilePath;
    }
}

