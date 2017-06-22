import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'email-action',
  templateUrl: './email-action.component.html',
  styleUrls: ['./email-action.component.scss']
})
export class EmailActionComponent implements OnInit {

    @Input() data;

    constructor() { }

    ngOnInit() {
    }

}
