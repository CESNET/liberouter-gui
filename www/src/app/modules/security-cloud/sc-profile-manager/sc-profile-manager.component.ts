import { Component, OnInit } from '@angular/core';

import { ScProfileManagerService } from './sc-profile-manager.service';
import { ProfileMap, Channel, ProfileLink } from '../modules/Profile';

@Component({
  selector: 'sc-profile-manager',
  templateUrl: './sc-profile-manager.component.html',
  styleUrls: ['./sc-profile-manager.component.scss'],
  providers: [ScProfileManagerService]
})
export class ScProfileManagerComponent implements OnInit {
    profiles: ProfileMap = null;
    linkList: ProfileLink[] = null;
    error = null;

    constructor(private api: ScProfileManagerService) { }

    ngOnInit() {
        this.reloadData();
    }

    /**
     *  @brief Retrieves the newest profile data
     */
    reloadData() {
        this.api.get().subscribe(
            (data: Object) => this.processProfilesData(data),
            (error: Object) => this.processError(error)
        );
    }

    /**
     *  @brief Processes retrieved profile data
     */
    processProfilesData(data: any) {
        this.profiles = new ProfileMap(data);
        this.linkList = this.profiles.getLinkList('');
    }

    /**
     *  @brief Processes error during profile retrieval
     */
    processError(error: Object) {
        if (error['status'] >= 404) {
            this.error = error;
        }

        console.error('Error when retrieving profiles:');
        console.error(error);
    }
}
