import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { ScDbqryIplookupService } from './sc-dbqry-iplookup.service';

@Component({
    selector: 'sc-dbqry-iplookup',
    templateUrl: './sc-dbqry-iplookup.component.html',
    styleUrls: ['./sc-dbqry-iplookup.component.scss'],
    providers: [ScDbqryIplookupService]
})
export class ScDbqryIplookupComponent implements OnInit {
    @ViewChild('LookupModal') modalElement: ElementRef;
    ipaddr: string;
    modalRef = null;
    lookupReverse = null;
    lookupIpinfo = null;
    lookupGeoinfo = null;
    geoinfoKeys = null;
    error = null;

    constructor(private api: ScDbqryIplookupService, public modalService: NgbModal) {}

    ngOnInit() {}

    /**
     *  @brief Opens a modal and remembers its handle
     */
    openModal(ipaddr: string) {
        this.ipaddr = ipaddr;
        this.modalRef = this.modalService.open(this.modalElement, {size: 'lg'});

        this.api.lookup(this.ipaddr).subscribe(
            (data: Object) => this.processData(data),
            (error: Object) => this.processError(error)
        );

        this.lookupReverse = null;
        this.lookupIpinfo = null;
        this.lookupGeoinfo = null;
    }

    /**
     *  @brief Parses and filters ip lookup data
     */
    processData(data: Object) {
        this.lookupReverse = data['revdns'];

        // List of relevant fields of ipinfo
        const acceptableInfos = [ 'inetnum', 'netname', 'descr', 'admin-c', 'mnt-by', 'role'
            , 'address', 'phone', 'fax-no', 'abuse-mailbox' ];

        // data['ipinfo'] is actually quite complex and redundant. This is why following filtering
        // is performed.
        this.lookupIpinfo = [];
        for (const o of data['ipinfo'].objects.object) {
            for (const a of o.attributes.attribute) {
                for (let i = 0; i < acceptableInfos.length; i++) {
                    if (acceptableInfos[i] === a.name) {
                        this.lookupIpinfo.push(a);
                        acceptableInfos.splice(i, 1);
                        i = acceptableInfos.length;
                    }
                }
            }
        }

        // List of relevant fields of geoinfo
        this.geoinfoKeys = ['city', 'country', 'countryCode', 'lat', 'lon', 'region', 'regionName'];
        // Structure of geoinfo object is simple, no need to filter it
        this.lookupGeoinfo = data['geoinfo'];
    }

    /**
     *  @brief Log error that occured on an async query
     */
    processError(error: Object) {
        if (error['status'] >= 404) {
            this.error = error;
        }

        console.error('Error on database request');
        console.error(error);
    }

    /**
     *  @brief Opens new tab with NERD database querying current ip address
     */
    jumpToNERD() {
        const url = 'https://nerd.cesnet.cz/nerd/ip/' + this.ipaddr;
        window.open(url, '_blank').focus();
    }
}
