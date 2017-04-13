import { Component, Pipe, PipeTransform } from '@angular/core';
import { Router } from '@angular/router';

import { ReporterService } from './reporter.service';

//import { nConfService } from './exporter_configuration.service';

@Component({
	selector : 'nemea-reporter-conf',
	templateUrl : './reporter_conf.html',
	styleUrls : ['./reporter_conf.scss'],
	providers : [ReporterService]
})
export class nemeaReporterConfComponent {

    reporters = [];
    error : string = '';
    selectedConfig : string = '';
    activeConfig = -1;

    config = {
        lineNumbers: true,
        mode : "x-yaml",
        gutter : true
    };

	constructor(private router : Router, private reporterService : ReporterService) {}

	ngOnInit() {
	    /*this.reporterService.reporters().subscribe(
			(data) => { this.reporters = data; },
			(error : Object) => this.processError(error)
		);*/

	   this.reporters = this.reporterService.reporters_dummy();
	}

	ngOnDestroy() {
	}

	selectReporter(reporter : number) {
	    console.log(reporter);
	    this.activeConfig = reporter['idx'];
	    try {
    	    this.getConfig(reporter["config"])
        } catch (err) {
            this.error = err;
        }

	    this.router.navigate(["nemea/reporters", reporter['idx']])
	}

	getConfig(path : string) {
	    if (path == undefined) {
	        this.error = "Config file for this reporter doesn't exist";
	        this.selectedConfig = '';
	        return;
	    }
	    this.error = '';
	    console.log("should get " + path)

	    this.selectedConfig = this.reporterService.config_dummy(this.activeConfig);
	}

	private processError(error : Object) {
		console.log(error);
		this.error = "Something went wrong";
	}

	saveConfig() {
	    try {
	        this.reporterService.save(this.activeConfig, this.selectedConfig);
        } catch (err) {
            console.log(err)
            this.error = err;

        }
	    /*
	    for (let rep of this.reporters) {
	        if (rep[1]['idx'] == this.activeConfig) {
	            console.log(rep)
	            return;
            }
	    }

        console.error("Couldnt find the exporter")
        */
	}

	onBlur() {
	    console.log("onblur");
	}

	onFocus() {
	    console.log("onfocus");
	}

}
