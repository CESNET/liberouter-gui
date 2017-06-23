import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-dash-modal',
  templateUrl: './dash-modal.component.html',
  styleUrls: ['./dash-modal.component.scss']
})
export class DashModalComponent implements OnInit {

    @Input() data: Object;

    public backup;

    constructor(public activeModal: NgbActiveModal) { }

    ngOnInit() {
        this.backup = Object.assign({}, this.data);
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
