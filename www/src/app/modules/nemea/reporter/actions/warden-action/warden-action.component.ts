import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'warden-action',
  templateUrl: './warden-action.component.html',
  styleUrls: ['./warden-action.component.scss']
})
export class WardenActionComponent implements OnInit {
    @Input() data;

    constructor() { }

    ngOnInit() {
    }

}
