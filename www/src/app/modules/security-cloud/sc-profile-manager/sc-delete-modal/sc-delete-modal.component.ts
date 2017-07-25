import { Component, OnInit, Input, Output, ViewChild, EventEmitter,
ElementRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { ScProfileManagerService } from '../sc-profile-manager.service';

@Component({
  selector: 'sc-delete-modal',
  templateUrl: './sc-delete-modal.component.html',
  styleUrls: ['./sc-delete-modal.component.scss']
})
export class ScDeleteModalComponent implements OnInit {
    @Input() profilePath: string;
    @Output() reloadProfiles = new EventEmitter<number>();
    @ViewChild('ProfileDeleteModal') modalElement: ElementRef;
    error = null;
    modalRef = null;

    constructor(public modalService: NgbModal, private api: ScProfileManagerService) { }

    ngOnInit() { }

    /**
     *  @brief Tries to delete a profile
     */
    deleteProfile() {
        this.api.delete(this.profilePath).subscribe(
            (data: Object) => this.processData(data),
            (error: Object) => this.processError(error)
        );
    }

    /**
     *  @brief Opens a modal and remembers its handle
     */
    openModal() {
        this.modalRef = this.modalService.open(this.modalElement, {size: 'lg'});
    }

    /**
     *  @brief Processesresult of profile deletion
     *
     *  @param [in] data Object with boolean success attribute
     *
     *  @details If profile was succesfully deleted, modal is closed and parent component is forced
     *  to reload list of profiles. Otherwise warning is printed and window is not closed.
     */
    processData(data: any) {
        if (data['success']) {
            this.modalRef.close();
            this.reloadProfiles.emit();
        }
        else {
            // TODO: Print some warning box
        }
    }

    processError(error: any) {
        if (error['status'] >= 404) {
            this.error = error;
        }

        console.error('Error when deleting profile:');
        console.error(error);
    }
}
