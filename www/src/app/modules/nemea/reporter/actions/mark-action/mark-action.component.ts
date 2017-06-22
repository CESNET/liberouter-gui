import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'mark-action',
  templateUrl: './mark-action.component.html',
  styleUrls: ['./mark-action.component.scss']
})
export class MarkActionComponent implements OnInit {

    @Input() data: Object;

    constructor() { }

    ngOnInit() { }

    isBool(value) {
        if (value.value.toLowerCase() === 'true') {
            value.value = true;
        } else if (value.value.toLowerCase() === 'false') {
            value.value = false;
        }

        return value;
    }
}
