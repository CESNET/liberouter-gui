import { Component, OnInit, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { Profile } from '../../modules/Profile';

@Component({
    selector: 'sc-view-modal',
    templateUrl: './sc-view-modal.component.html',
    styleUrls: ['./sc-view-modal.component.scss']
})
export class ScViewModalComponent implements OnInit {
    @Input() profile: Profile;

    constructor(public modalService: NgbModal) { }

    ngOnInit() {}
}
