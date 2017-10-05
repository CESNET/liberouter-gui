/**
  * FTAS as an iframe module with configuration
  *
  * Config items:
  * 'url' : simple URL (without protocol) to FTAS instance
  * 'fullUrl' : Full URL to filtering script (usually "example.com/ftas/stat.pl")
  * Specify URL without URL (https is forced)
  *     If this option is not set, url must be.
  *     If both are set, fullUrl is used.
  * 'output' : Specify which output machines will be used
  * Can be a list (as string): "1,2,5,10"
  */

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { URLSearchParams } from '@angular/http';
import { SafeResourceUrl } from '@angular/platform-browser';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { ConfigService } from 'app/services';

import { FtasModalComponent } from './ftas-modal/ftas-modal.component'


@Component({
  selector : 'app-ftas',
  templateUrl : './ftas.component.html',
  styleUrls : ['./ftas.component.scss']
})
export class FtasComponent implements OnInit {
    // FTAS URL for iframe
    baseUrl: string;

    // Sanitizied URL for iframe
    url: SafeResourceUrl;

    // Advanced filter field for FTAS
    filter: string;

    // Flag for iframe initialization routine
    iframeInit: Boolean = false;
    // The loading message
    ftasMsg = '';

    // URL parameters
    params: Object;

    // Configuration fetched froms backend
    config: Object = {};

    // Output ID
    output: number;

    // Reference to modal window
    modalRef;

    constructor(private route: ActivatedRoute,
               private configService: ConfigService,
               private modalService: NgbModal) {}

    /**
      * Get configruation and URL params and prepare the advanced query field
      * for FTAS iframe
      */
    ngOnInit() {
        this.configService.getModule('ftas').subscribe(
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
            for (const key in params) {
                if (key !== 'first' && key !== 'last') {
                    if (this.filter === undefined) {
                        this.filter = key + '=' + params[key];
                    } else {
                        this.filter += ' and ' + key + '=' + params[key];
                    }
                }
            }
            this.setUrl();
        });
    }

    /**
      * Set FTAS URL
      * If params are set we can do some filtering
      *
      * Fall-through model for setting the baseUrl where preferred method
      * is fullUrl -> url -> show modal with settings
      */
    private setUrl() {
        this.baseUrl = 'https://';
        if (this.config['fullUrl']) {
            this.baseUrl = this.config['fullUrl']
        } else if (this.config['url']) {
            this.baseUrl += this.config['url'] + '/ftas/stat.pl';
        }

        this.output = +this.config['output'];

        console.log(this.baseUrl, this.output)

        if (isNaN(this.output) || this.baseUrl === 'https://') {
            console.warn('FTAS output or URL isn\'t set.');

            // Open modal window
            this.openSettings();
        } else {
            // Set URL params
            if (this.filter === undefined) {
                this.url = this.baseUrl;
            } else {
                this.url = this.baseUrl + '?'
                    + this.generateQueryBase()
                    + '&advanced_query='
                    + encodeURIComponent(this.filter);
            }
        }
    }

    /**
      * Outputs loading message if iframe is loaded but not its contents
      * (load) fires two times: first time when iframe element is loaded
      * and second time when its content is loaded.
      *
      * Not used in current setup, because (load) is fired nondeterministically
      */
    iframeLoaded() {
        if (!this.iframeInit) {
            this.ftasMsg = 'FTAS is loading...';
        } else {
            this.ftasMsg = '';
        }

        this.iframeInit = !this.iframeInit;
    }

    /**
      * open modal window with settings
      *
      * on close, save settings and regenerate URL
      * on dismissal do nothing
      */
    openSettings(update: boolean = true) {
        this.modalRef = this.modalService.open(FtasModalComponent);
        this.modalRef.componentInstance.data = this.config;
        this.modalRef.result.then(
            (result) => {
                if (update) {
                    // The modal was closed, save settings
                    this.configService.update('ftas', this.config).subscribe(
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
                    newconfig['name'] = 'ftas';
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

    /**
      * Set filtering parameters base for FTAS
      * Filtering something in FTAS requires a lot of parameters to set.
      */
    private generateQueryBase(): URLSearchParams {
        const queryBase = new URLSearchParams();

        queryBase.set('select_output', String(this.output));
        queryBase.set('select_output-use', 'yes');
        queryBase.set('query_style', 'advanced');
        // this.query.set("advanced_query", "dst_ip%3D193.170.227.139");
        queryBase.set('first', this.params['first']);
        queryBase.set('last', this.params['last']);
        queryBase.set('use_all_fields', '1');
        queryBase.set('query', 'yes');
        queryBase.set('run_query', 'yes');
        queryBase.set('max_query_time', '60');
        queryBase.set('max_query_count', '10000');
        queryBase.set('viewer', 'yes');
        queryBase.set('in_one_step', '1');
        queryBase.set('viewer_display', 'Show');
        queryBase.set('viewer_aggregate', 'yes');
        queryBase.set('viewer_display_type', 'graph');
        queryBase.set('graph_order_direction', 'desc');
        queryBase.set('viewer_selected_view', '40');
        queryBase.set('viewer_page_size', '1000');
        queryBase.set('resolvegeolocation_global', 'yes');
        queryBase.set('show_percent', 'yes');
        // this.query.set("viewer_hide_form", "1");

        /**
          * .append must be used here, .set overwrites the existing field
          */
        queryBase.append('viewer_requested_fields', 'src_ip');
        queryBase.append('viewer_requested_fields', 'dst_ip');
        queryBase.append('viewer_requested_fields', 'proto');
        queryBase.append('viewer_requested_fields', 'octets');
        queryBase.append('viewer_requested_fields', 'dst_ip_cnt');
        queryBase.append('viewer_requested_fields', 'flow_source');
        queryBase.append('viewer_requested_fields', 'first');
        queryBase.append('viewer_requested_fields', 'last');

        return queryBase;
    }

}
