import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'file-action',
  templateUrl: './file-action.component.html',
  styleUrls: ['./file-action.component.scss']
})
export class FileActionComponent implements OnInit {

    @Input() data;

    constructor() { }

    ngOnInit() {
        if (!('dir' in this.data)) {
            this.data['dir'] = false;
        }
    }

    isBool(item) {}

}
