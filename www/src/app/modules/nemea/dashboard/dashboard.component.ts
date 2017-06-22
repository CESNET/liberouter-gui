import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbDropdown, NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { DashModalComponent } from './dash-modal/dash-modal.component';

import { UsersService } from 'app/modules/users/users.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  providers : [ UsersService ]
})
export class DashboardComponent implements OnInit {

    private dashboards: Array<any>;

    // LocalStorage currentUser
    private user: Object;
    private modalRef;

    @ViewChild('tabs')
    private tabs;

    constructor(private usersService: UsersService,
               private modalService: NgbModal) {}

    /**
      * Get dashboard config from local storage
      *
      * If no box is there add a clean box (empty dashboard is a sad dashboard)
      */
    ngOnInit() {
        this.user = JSON.parse(localStorage['currentUser']);

        // Load settings for dashboard (boxes configuration)
        try {
            this.dashboards = this.user['user']['settings']['nemea']['dashboard'];
        } catch (e) {
            console.log(e);
            this.addCleanDashboard();
        }
    }

    addCleanDashboard() {
        this.dashboards = [{
            title : 'Untitled Dashboard',
            offset : 0,
            boxes : []
        }]

        this.save();
    }

    addDashboard(title: string, offset = 0) {
        if (title.length) {
            const dash = {
                'title' : title,
                'boxes' : [],
                'offset' : Number(offset)
            }

            this.dashboards.push(dash)
            this.save();
        }
    }

    /**
      * Save settings of the dashboard to localStorage
      *
      * Reload the component in case of offset change
      *
      * This looks really bad but we can't be sure what is inside localStorage
      */
    save($event = {}, reload = false): void {

        const user = JSON.parse(localStorage.getItem('currentUser'));

        if (user['user']['settings'] == null) {
            user['user']['settings'] = { 'nemea' : { 'dashboard' : this.dashboards } };
        } else {
            if ('nemea' in user['user']['settings']) {
                if ('dashboard' in user['user']['settings']['nemea']) {
                    user['user']['settings']['nemea']['dashboard'] = this.dashboards;
                } else {
                    user['user']['settings']['nemea'] = { 'dashboard' : this.dashboards };
                }
            } else {
                user['user']['settings'] = { 'nemea' : { 'dashboard' : this.dashboards } };
            }
        }

        this.usersService.update(user['user']['_id']['$oid'], user['user']).subscribe(
            data => {
                user['user'] = data;
                localStorage.setItem('currentUser', JSON.stringify(user));
                if (reload) {
                    this.ngOnInit();
                }
            },
            error => {
                console.log(error);
                // Save local copy anyway
                localStorage.setItem('currentUser', JSON.stringify(user));

                if (reload) {
                    this.ngOnInit();
                }

            }
        )
    }

    editDashboard(dashboard) {
        const offset = dashboard['offset']

        this.modalRef = this.modalService.open(DashModalComponent);
        this.modalRef.componentInstance.data = dashboard;

        this.modalRef.result.then(
            (result) => {
                /**
                  * Closed with a button, replace current model with the new one
                  * Also would be nice to reload data
                  */

                this.save({}, dashboard['offset'] !== offset);

            },
            (reason) => {
                // Dismissal of the modal, do nothing
            }
        );
    }

    /**
      * Remove a dashboard from dashboard array and save it
      */
    deleteDashboard(dashboard, $event) {

        $event.preventDefault();

        this.tabs.select('ngb-tab-1');

        const index = this.dashboards.indexOf(dashboard, 0);

        if (index > -1) {
            this.dashboards.splice(index, 1);
            this.save();
        }
    }

    change($event) {
        console.log($event);
    }

}
