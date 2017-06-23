import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'event-detail',
    templateUrl: './event-detail.component.html',
    styleUrls: ['./event-detail.component.scss']
})
export class EventDetailComponent implements OnInit {
    @Input() data: Object;

    ftasUrl = '/ftas';
    ftasUrlParams: Object = {};

    scUrl = '/security-cloud';
    scUrlParams: Object = {};

    nerdUrl = '/nerd';
    nerdUrlParams: Object = {};

    constructor(public activeModal: NgbActiveModal,
                private router: Router) {}

    ngOnInit() {
    }

    ftas() {
        // Add source IP to query
        if (this.data['Source'] !== undefined && this.data['Source'][0]['IP4'] !== undefined) {
            this.ftasUrlParams['src_ip'] = this.data['Source'][0]['IP4'][0];
            console.log('adding src IP')
        }

        // Add target IP to query
        if (this.data['Target'] !== undefined && this.data['Target'][0]['IP4'] !== undefined) {
            this.ftasUrlParams['dst_ip'] = this.data['Target'][0]['IP4'][0];
            console.log('adding dst IP')
        }

        // Add time to query
        this.ftasUrlParams['first'] = Math.floor(this.data['DetectTime']['$date']/1000) - 600;
        this.ftasUrlParams['last'] = Math.floor(Date.now()/1000);

        this.activeModal.close([this.ftasUrl, this.ftasUrlParams]);
    }

    scgui() {
        const time = new Date(this.data['DetectTime']['$date'])
        this.scUrlParams = {'eventtime' : Math.floor(time.getTime()/1000)}

        console.log(this.scUrlParams)
        this.activeModal.close([this.scUrl, this.scUrlParams]);
    }

    nerd() {
        if (this.data['Source'] !== undefined && this.data['Source'][0]['IP4'] !== undefined) {
            this.nerdUrlParams['ip'] = this.data['Source'][0]['IP4'][0];
        } else if (this.data['Target'] !== undefined && this.data['Target'][0]['IP4'] !== undefined) {
            this.nerdUrlParams['ip'] = this.data['Target'][0]['IP4'][0];
        }

        this.activeModal.close([this.nerdUrl, this.nerdUrlParams]);
    }
}
