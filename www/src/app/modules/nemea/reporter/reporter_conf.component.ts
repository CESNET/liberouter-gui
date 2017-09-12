import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { ReporterService } from './reporter.service';

@Component({
    selector : 'nemea-reporter-conf',
    templateUrl : './reporter_conf.html',
    styleUrls : ['./reporter_conf.scss'],
    providers : [ReporterService]
})
export class NemeaReporterConfComponent implements OnInit {

    error: Object;
    success = {
        message : 'Configuration saved. You should restart reporters now.',
        success : false
    };
    config: Object = {};

    constructor(private router: Router,
                private reporterService: ReporterService) {}

    ngOnInit() {
        this.getConfig();
    }

    getConfig() {
        this.reporterService.get().subscribe(
            (data) => {
                this.error = {};
                this.config = data;
            },
            (error: Object) => this.processError(error)
        );
    }

    saveConfig() {
        this.success.success = false;
        this.reporterService.update(this.config).subscribe(
            (data) => {
                this.config = data;
                this.success.success = true;
            },
            (error: Object) => this.processError(error)
        );
    }

    addAddrGroup(list: boolean = false) {
        const newaddr = list ? {'id' : '', 'list' : ['1.1.1.1']} : {id : '', file : 'path/to/file'}
        this.config['addressgroups'].push(newaddr)
    }

    addAddrGroupIP(list: Object) {
        this.config['addressgroups']['list'].push('');
    }

    remove(section: string, index: number) {
        console.log('deleting', index)
        this.config[section].splice(index, 1);
    }

    getActionType(item: Object): String {
        if ('mongo' in item) {
            return 'mongo'
        } else if ('file' in item) {
            return 'file'
        } else if ('mark' in item) {
            return 'mark'
        } else if ('email' in item) {
            return 'email'
        } else if ('trap' in item) {
            return 'trap'
        } else if ('warden' in item) {
            return 'warden'
        }
    }

    trackActions(id: number, data: string) {
        return id;
    }

    addAction(item_type: string) {
        const item = {
            'id' : ''
        }
        console.log(item_type)
        switch(item_type) {
            case 'mongo' : {
                item['mongo'] = {
                    'db' : '',
                    'collection' : ''
                }

                break;
            }

            case 'mark' : {
                item['mark'] = {
                    'path' : '',
                    'value' : ''
                }

                break;
            }

            case 'file' : {
                item['file'] = {}
                break;
            }

            default : {
                item[item_type] = {}
                break;
            }

        }

        this.config['custom_actions'].push(item);
    }

    /**
      * Display error and create an empty config
      */
    private processError(error: Object) {
        console.log(error);
        this.success.success = false;
        this.error = JSON.parse(error['_body']);

        this.config = {
            'rules' : [],
            'custom_actions' : [],
            'addressgroups' : []
        }
    }
}
