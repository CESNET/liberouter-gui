import { Component, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'sc-dbqry-fdisthelp',
    templateUrl: './sc-dbqry-fdisthelp.component.html',
    styleUrls: ['./sc-dbqry-fdisthelp.component.scss']
})
export class ScDbqryFdisthelpComponent {
    constructor(public modalService: NgbModal) {}
}
