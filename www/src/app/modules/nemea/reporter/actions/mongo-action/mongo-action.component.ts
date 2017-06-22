import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'mongo-action',
  templateUrl: './mongo-action.component.html',
  styleUrls: ['./mongo-action.component.scss']
})
export class MongoActionComponent implements OnInit {
    @Input() data;

    constructor() { }

    ngOnInit() {
    }

}
