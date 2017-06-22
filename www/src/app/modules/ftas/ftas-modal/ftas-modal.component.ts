import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-ftas-modal',
  templateUrl: './ftas-modal.component.html',
  styleUrls: ['./ftas-modal.component.scss']
})
export class FtasModalComponent implements OnInit {

    // Model data
    data;

    // Backup of model data detached from ngModel
    public backup;

    constructor(public activeModal: NgbActiveModal) { }

    ngOnInit() {
        this.backup = Object.assign({}, this.data);
    }

    /**
      * Closing a modal with a button => save the state
      */
    close(result: any): void {
        this.data = Object.assign(this.data,this.backup);
        this.activeModal.close(result);
    }

    /**
      * Dismissal of a modal window => don't save the state
      */
    dismiss(result: any): void {
        this.activeModal.dismiss(result);
    }
}
