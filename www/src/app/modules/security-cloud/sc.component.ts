// Global modules
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { URLSearchParams } from '@angular/http';
import { SafeResourceUrl } from '@angular/platform-browser';

import { environment } from 'environments/environment';

// Local modules
import { ProfileMap, Channel, ProfileLink } from './modules/Profile';
import { ChannelSettings, ChannelSettingsBuilder } from './modules/ChannelSettings';
import { TimeSpecs, TimeSelection, TimeView } from './modules/TimeSpecs';
import { AppConfig } from './modules/AppConfig';

// Service
import { ScService } from './sc.service';

@Component({
    selector: 'security-cloud',
    template : `
<div class="container-fluid mb-4">
    <div class="card">
        <div class="card-block">
            <div class="row">
                <div class="col">
                    <h2>SecurityCloud</h2>
                </div>
                <div class="col">
                    <a routerLink='workbench' class="btn btn-secondary btn-block">
                        Workbench
                    </a>
                </div>
                <div class="col">
                    <a routerLink='profileManager' class="btn btn-secondary btn-block">
                        Profile manager
                    </a>
                </div>
            </div>
        </div>
    </div>
</div>
<router-outlet></router-outlet>`
})
export class SecurityCloudComponent implements OnInit {
    constructor(private route: ActivatedRoute) {}

    ngOnInit() {}
}

@Component({
    selector : 'sc-workbench-cloud',
    templateUrl : './sc.component.html',
    styleUrls : ['./sc.component.scss'],
    providers : [ScService]
})
export class ScWorkbenchComponent implements OnInit {
    profiles: ProfileMap = null;
    channels: ChannelSettings[] = null;
    config: AppConfig = null;
    selectedProfile: string = null; ///< Identifier of currently selected profile(default: /live)
    linkList: ProfileLink[] = null;
    error: any = null;
    filterOverride = ''; ///< In case filter is passed as a url parameter
    @ViewChild('GraphComponent') graphComponent;

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
        const params = this.route.snapshot.queryParamMap;
        this.time.view.bgn = -1;
        this.time.view.end = -1;
        this.time.view.res = -1;
        this.time.sel.bgn = -1;
        this.time.sel.end = -1;
        this.selectedProfile = '/live';

        if (params.has('profile')) {
            this.selectedProfile = params.get('profile');
        }

        if (params.has('tbgn') && params.has('tend') && params.has('tres')) {
            this.time.view.bgn = parseInt(params.get('tbgn'), 10);
            this.time.view.end = parseInt(params.get('tend'), 10);
            this.time.view.res = parseInt(params.get('tres'), 10);
        }

        if (params.has('start') && params.has('end')) {
            this.time.sel.bgn = parseInt(params.get('start'), 10);
            this.time.sel.end = parseInt(params.get('end'), 10);
        }

        if (params.has('filter')) {
            this.filterOverride = params.get('filter');
        }

        this.getProfilesData();
        this.getConfigData();
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
        this.channels = ChannelSettingsBuilder.init(this.profiles, this.selectedProfile);
        this.linkList = this.profiles.getLinkList('');
    }

    /**
     *  @brief Handle for processing incoming AppConfig data
     */
    processAppConfigData(data: any) {
        this.config = data;
        console.log(this.config);
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
        this.channels = ChannelSettingsBuilder.init(this.profiles, this.selectedProfile);
    }

    /**
     *  @brief Fires up new instance of the GUI in the new browser tab
     */
    openNewTab() {
        let url = '/security-cloud/workbench';
        url += '?profile=' + encodeURI(this.selectedProfile);
        url += '&tbgn=' + this.time.view.bgn;
        url += '&tend=' + this.time.view.end;
        url += '&tres=' + this.time.view.res;
        url += '&start=' + this.time.sel.bgn;
        url += '&end=' + this.time.sel.end;
        window.open(url, '_blank').focus();
    }

    setAllChannels(value: boolean) {
        for (let i = 0; i < this.channels.length; i++) {
            if (this.channels[i].checked !== value) {
                this.graphComponent.changeChannelVisibility(i);
                this.channels[i].checked = value;
            }
        }
    }
}

