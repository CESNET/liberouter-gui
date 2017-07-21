import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'sc-dbqry-iplookup',
    templateUrl: './sc-dbqry-iplookup.component.html',
    styleUrls: ['./sc-dbqry-iplookup.component.scss']
})
export class ScDbqryIplookupComponent implements OnInit {
    @ViewChild('LookupModal') modalElement: ElementRef;
    ipaddr: string;
    modalRef = null;
    lookupReverse = '';
    lookupIpinfo = '';
    lookupGeoinfo = '';
    
    constructor(public modalService: NgbModal) { }

    ngOnInit() {}
    
    /**
     *  @brief Opens a modal and remembers its handle
     */
    openModal(ipaddr: string) {
        this.ipaddr = ipaddr;
        this.modalRef = this.modalService.open(this.modalElement, {size: 'lg'});
    }
}
