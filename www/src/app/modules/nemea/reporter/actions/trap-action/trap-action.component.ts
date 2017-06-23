import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'trap-action',
  templateUrl: './trap-action.component.html',
  styleUrls: ['./trap-action.component.scss']
})
export class TrapActionComponent implements OnInit {

    @Input() data;

    constructor() { }

    ngOnInit() {
    }

}
