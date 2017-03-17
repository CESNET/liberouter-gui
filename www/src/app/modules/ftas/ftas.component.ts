import { Component, OnInit, SecurityContext, PipeTransform, Pipe } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { URLSearchParams } from '@angular/http';

@Pipe({ name: 'safe' })
export class SafePipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}
  transform(url) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}

@Component({
  selector : 'app-ftas',
  templateUrl : './ftas.component.html',
  styleUrls : ['./ftas.component.scss']
})
export class FtasComponent implements OnInit {

    query : URLSearchParams = new URLSearchParams();
    baseUrl : string = "https://ftas.cesnet.cz/ftas/stat.pl";
    url: SafeResourceUrl;
    filter : string;

    constructor(private sanitizer : DomSanitizer, private route : ActivatedRoute ) { }

    ngOnInit() {

        // Get all the URL params and prepare the advanced query field (basically filter)
        this.route.params.subscribe(params => {
            //this.params = params;
            console.log(params);

            for (var key in params) {
                if (this.filter == undefined) {
                    this.filter = key + "=" + params[key];
                }
                else {
                    this.filter += "and " + key + '=' + params[key];
                }
            }

            console.log(this.filter)
        });

        // Set URL params as query params
        this.query.set("select_output", "1402");
        this.query.set("select_output-use", "yes");
        this.query.set("query_style", "advanced");
        //this.query.set("advanced_query", "dst_ip%3D193.170.227.139");
        this.query.set("first", "today 8:00");
        this.query.set("last", "today 10:00");
        this.query.set("use_all_fields", "1");
        this.query.set("query", "yes");
        this.query.set("run_query", "yes");
        this.query.set("max_query_time", "60");
        this.query.set("max_query_count", "10000");
        this.query.set("viewer", "yes");
        this.query.set("in_one_step", "1");
        this.query.set("viewer_display", "Show");
        this.query.set("viewer_aggregate", "yes");
        this.query.set("viewer_display_type", "graph");
        this.query.set("graph_order_direction", "desc");
        this.query.set("viewer_selected_view", "40");
        this.query.set("viewer_page_size", "1000");
        this.query.set("resolvegeolocation_global", "yes");
        this.query.set("show_percent", "yes");
        //this.query.set("viewer_hide_form", "1");

        this.query.append("viewer_requested_fields", "src_ip");
        this.query.append("viewer_requested_fields", "dst_ip");
        this.query.append("viewer_requested_fields", "proto");
        this.query.append("viewer_requested_fields", "octets");
        this.query.append("viewer_requested_fields", "dst_ip_cnt");
        this.query.append("viewer_requested_fields", "flow_source");
        this.query.append("viewer_requested_fields", "first");
        this.query.append("viewer_requested_fields", "last");

        if (this.filter == undefined)
            this.url = this.baseUrl + '?' + this.query.toString();
        else
            this.url = this.baseUrl + '?' + this.query.toString() + "&advanced_query=" + encodeURIComponent(this.filter);
        //this.sanitizer.bypassSecurityTrustResourceUrl(this.sanitizer.sanitize(SecurityContext.RESOURCE_URL, this.baseUrl))
    }

}
