import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal, NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';

import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';

const metrics = ['Category', 'Node.Name', 'Node.SW', 'Target.IP4', 'Source.IP4']

@Component({
  selector: 'app-dash-item',
  templateUrl: './dash-box-modal.component.html',
  styleUrls: ['./dash-box-modal.component.scss']
})
export class DashBoxModalComponent implements OnInit {

    @Input() data: Object;

    // Array of options for type selector
    private types = [
        {
            value : 'piechart',
            name : 'Piechart'
        },
        {
            value : 'barchart',
            name : 'Barchart'
        },
        {
            value : 'top',
            name : 'Top N'
        },
        {
            value : 'count',
            name : 'Count'
        }
    ]

    public backup;
    private modal;

    constructor(public activeModal: NgbActiveModal) { }

    ngOnInit() {
        // Save current model as backup
        this.backup = Object.assign({}, this.data);
    }

    /**
      * Typeahead lookup
      */
    searchMetric = (inputTerm: Observable<string>) => {
        return inputTerm
            .debounceTime(200)
            .distinctUntilChanged()
            .map(term => term.length < 2 ? []
                : metrics.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0,10));
    }

    /**
      * Closing a modal with a button => save the state
      */
    close(result: any): void {
        console.log(result);
        this.data = Object.assign(this.data,this.backup);
        this.activeModal.close(result);
    }

    /**
      * Dismissal of a modal window => don't save the state
      */
    dismiss(result: any): void {
        console.log(result);
        this.activeModal.dismiss(result);
    }

}
