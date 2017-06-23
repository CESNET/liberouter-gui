/**
  * simple URL (without protocol) to NERD instance
  * url : "nerd.cesnet.cz/nerd",
  *
  * 'fullUrl': Full URL to filtering script (usually "example.com/nerd")
  * Specify URL without URL (https is forced)
  * If this option is not set, url must be.
  * If both are set, fullUrl is used.
  */

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { URLSearchParams } from '@angular/http';
import { SafeResourceUrl } from '@angular/platform-browser';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { ConfigService } from 'app/services';

import { NerdModalComponent } from './nerd-modal/nerd-modal.component'


@Component({
  selector : 'app-nerd',
  templateUrl : './nerd.component.html',
  styleUrls : ['./nerd.component.scss']
})
export class NerdComponent implements OnInit {

    // NERD URL for iframe
    baseUrl: string;

    // Sanitizied URL for iframe
    url: SafeResourceUrl;

    // Flag for iframe initialization routine
    iframeInit: Boolean = false;
    // The loading message
    msg = '';

    // URL parameters
    params: Object;

    // Configuration fetched froms backend
    config: Object = {};

    // Reference to modal window
    modalRef;

    /**
      * Construct the FTAS URL from environment variables
      */
    constructor(private route: ActivatedRoute,
                private configService: ConfigService,
                private modalService: NgbModal) {
    }

    /**
      * Get URL params and prepare the advanced query field for NERD iframe
      */
    ngOnInit() {
        this.configService.getModule('nerd').subscribe(
            config => {
                this.config = config;
                this.fetchParams();
            },
            error => {
                // Config for module doesn't exist
                if (error.status === 404) {
                    console.log(error);
                    this.openSettings(false);
                }
            }
        );
    }

    /**
      * Fetch parameters from the route and create filter from them
      *
      * Then set URL for iframe
      */
    private fetchParams() {
        this.route.params.subscribe(params => {
            this.params = params;
            this.setUrl();
        });
    }

    /**
      * Set NERD URL
      * If params are set we can do IP filtering
      *
      * Fall-through model for setting the baseUrl where preferred method
      * is fullUrl -> url -> show modal with settings
      */
    private setUrl() {
        this.baseUrl = 'https://';

        if (this.config['fullUrl']) {
            this.baseUrl = this.config['fullUrl']
        } else if (this.config['url']) {
            this.baseUrl += this.config['url'];
        }

        if (this.baseUrl === 'https://') {
            this.openSettings();
        }

        if (!this.params || !this.params['ip']) {
            this.url = this.baseUrl;
        } else {
            this.url = this.baseUrl + '/ip/' + this.params['ip'];
        }
    }


    /**
      * Outputs loading message if iframe is loaded but not its contents
      * (load) fires two times: first time when iframe element is loaded
      * and second time when its content is loaded.
      */
    iframeLoaded() {
        if (!this.iframeInit) {
            this.msg = 'NERD is loading...';
        } else {
            this.msg = '';
        }

        this.iframeInit = !this.iframeInit;
    }

    /**
      * open modal window with settings
      *
      * on close, save settings and regenerate URL
      * on dismissal check if the HTTP Status is 404, which means the config
      * for such module doesn't exist, in that case reopen with new params.
      */
    openSettings(update: boolean = true) {
        this.modalRef = this.modalService.open(NerdModalComponent);
        this.modalRef.componentInstance.data = this.config;
        this.modalRef.result.then(
            (result) => {
                // The modal was closed, save settings
                if (update) {
                    this.configService.update('nerd', this.config).subscribe(
                        (data) => {
                            this.config = data;
                            this.setUrl();
                        },
                        (error) => {
                            console.error(error);
                            if (error.status === 404) {
                                this.openSettings(false);
                            }
                        });
                } else {
                    const newconfig = Object.assign({}, this.config);
                    newconfig['name'] = 'nerd';
                    this.configService.add(newconfig).subscribe(
                        (data) => {
                            this.config = data;
                            this.setUrl();
                        },
                        (error) => {
                            console.error(error);
                        });
                }
            },
            (reason) => {
                // dismissal, do nothing
            });
    }

}
