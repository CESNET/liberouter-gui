import { Component, OnInit, Input, Output, ViewChild, EventEmitter,
ElementRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { ScProfileManagerService } from '../sc-profile-manager.service';
import { Profile, Channel } from '../../modules/Profile';

class SourceCheck {
    checked: boolean;
    name: string;
}

@Component({
  selector: 'sc-create-modal',
  templateUrl: './sc-create-modal.component.html',
  styleUrls: ['./sc-create-modal.component.scss']
})
export class ScCreateModalComponent implements OnInit {
    @Input() parentProfile: Profile;
    @Output() reloadProfiles = new EventEmitter<number>();
    @ViewChild('ProfileCreateModal') modalElement: ElementRef;
    profile = null;
    error = null;
    channelCount = 1;
    modalRef = null;
    alerts = null;

    constructor(public modalService: NgbModal, private api: ScProfileManagerService) { }

    ngOnInit() {
        this.profile = {
            name: 'New_profile',
            type: 'normal',
            path: this.parentProfile['path'],
            channels: null
        };

        this.profile.channels = new Array(1);
        this.initNewChannel(0);
    }

    createProfile() {
        this.alerts = []

        let channels = '';

        for (const x of this.profile.channels) {
            if (channels !== '') {
                channels += ';'
            }

            channels += x.name + ':' + x.filter;

            for (const s of x.sources) {
                if (s.checked) {
                    channels += ':' + s.name;
                }
            }
        }

        this.api.create(
            this.parentProfile.path,
            this.profile.name,
            this.profile.type,
            channels
        ).subscribe(
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

    initNewChannel(index: number) {
        this.profile.channels[index] = {
            name: 'New_Channel',
            filter: '',
            sources: null
        };

        this.profile.channels[index].sources = new Array(this.parentProfile.channels.length);

        for (let i = 0; i < this.parentProfile.channels.length; i++) {
            this.profile.channels[index].sources[i] = {
                checked: true,
                name: this.parentProfile.channels[i].name
            }
        }
    }

    setNofChannels() {
        let i: number = this.profile.channels.length;
        while (this.profile.channels.length < this.channelCount) {
            this.profile.channels.push();
            this.initNewChannel(i);
            i++;
        }
        while (this.profile.channels.length > this.channelCount) {
            this.profile.channels.pop();
        }
    }

    processData(data: any) {
        if (data['success']) {
            this.modalRef.close();
            this.reloadProfiles.emit();
        }
        else {
            this.alerts = data['alerts'];
        }
    }

    processError(error: any) {
        if (error['status'] >= 404) {
            this.error = error;
        }

        console.error('Error when creating profile:');
        console.error(error);
    }
}
