import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { URLSearchParams } from '@angular/http';
import { SafeResourceUrl } from '@angular/platform-browser';

import { environment } from 'environments/environment';


@Component({
  selector : 'app-ftas',
  templateUrl : './ftas.component.html',
  styleUrls : ['./ftas.component.scss']
})
export class FtasComponent implements OnInit {

    baseUrl : string = "https://";  // FTAS URL for iframe
    url: SafeResourceUrl;           // Sanitizied URL for iframe
    filter : string;                // Advanced filter field for FTAS
    iframeInit : Boolean = false;   // Flag for iframe initialization routine
    ftasMsg : string = "";          // The loading message
    params : Object;

    /**
      * Construct the FTAS URL from environment variables
      */
    constructor( private route : ActivatedRoute ) {
        /**
          * Environment can set full url of the FTAS instance
          */
        if (environment.ftas.fullUrl) {
            this.baseUrl = environment.ftas.fullUrl
        } else if (environment.ftas.url) {
            this.baseUrl += environment.ftas.url + "/ftas/stat.pl";
        } else {
            console.warn("FTAS URL isn't set.");
        }
    }

    /**
      * Get URL params and prepare the advanced query field for FTAS iframe
      */
    ngOnInit() {
        this.route.params.subscribe(params => {
        	this.params = params;
            for (var key in params) {
            	if (key != 'first' && key != 'last') {
					if (this.filter == undefined) {
						this.filter = key + "=" + params[key];
					}
					else {
						this.filter += " and " + key + '=' + params[key];
					}
				}
            }

            /**
              * Setup FTAS URL
              * If params are set we can do some filtering
              */
            if (this.filter == undefined)
                this.url = this.baseUrl;
            else {
                this.url = this.baseUrl + '?'
                    + this.generateQueryBase()
                    + "&advanced_query="
                    + encodeURIComponent(this.filter);
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
            this.ftasMsg = "FTAS is loading...";
        } else {
            this.ftasMsg = "";
        }

        this.iframeInit = !this.iframeInit;
    }

    /**
      * Set filtering parameters base for FTAS
      * Filtering something in FTAS requires a lot of parameters to set.
      *
      * TODO: Reflect correctly time in "first" and "last" fields
      */
    private generateQueryBase() : URLSearchParams {
        let queryBase = new URLSearchParams();

        queryBase.set("select_output", environment.ftas.output);
        queryBase.set("select_output-use", "yes");
        queryBase.set("query_style", "advanced");
        //this.query.set("advanced_query", "dst_ip%3D193.170.227.139");
        queryBase.set("first", this.params["first"]);
        queryBase.set("last", this.params["last"]);
        queryBase.set("use_all_fields", "1");
        queryBase.set("query", "yes");
        queryBase.set("run_query", "yes");
        queryBase.set("max_query_time", "60");
        queryBase.set("max_query_count", "10000");
        queryBase.set("viewer", "yes");
        queryBase.set("in_one_step", "1");
        queryBase.set("viewer_display", "Show");
        queryBase.set("viewer_aggregate", "yes");
        queryBase.set("viewer_display_type", "graph");
        queryBase.set("graph_order_direction", "desc");
        queryBase.set("viewer_selected_view", "40");
        queryBase.set("viewer_page_size", "1000");
        queryBase.set("resolvegeolocation_global", "yes");
        queryBase.set("show_percent", "yes");
        //this.query.set("viewer_hide_form", "1");

        /**
          * .append must be used here, .set overwrites the existing field
          */
        queryBase.append("viewer_requested_fields", "src_ip");
        queryBase.append("viewer_requested_fields", "dst_ip");
        queryBase.append("viewer_requested_fields", "proto");
        queryBase.append("viewer_requested_fields", "octets");
        queryBase.append("viewer_requested_fields", "dst_ip_cnt");
        queryBase.append("viewer_requested_fields", "flow_source");
        queryBase.append("viewer_requested_fields", "first");
        queryBase.append("viewer_requested_fields", "last");

        return queryBase;

    }

}
