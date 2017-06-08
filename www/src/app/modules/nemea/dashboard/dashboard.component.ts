import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbDropdown } from '@ng-bootstrap/ng-bootstrap';

import { UsersService } from 'app/modules/users/users.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  providers : [ UsersService ]
})
export class DashboardComponent implements OnInit {

	private dashboards : Array<any>;

	// LocalStorage currentUser
	private user : Object;

	@ViewChild('tabs')
	private tabs;

	constructor(private usersService : UsersService) {}

	/**
	  * Get dashboard config from local storage
	  *
	  * If no box is there add a clean box (empty dashboard is a sad dashboard)
	  */
	ngOnInit() {
		this.user = JSON.parse(localStorage["currentUser"]);

		// Load settings for dashboard (boxes configuration)
		try {
			console.log(this.user["user"]["settings"]["nemea"]["dashboard"]);
			this.dashboards = this.user["user"]["settings"]["nemea"]["dashboard"];
		} catch (e) {
			console.log(e);
			this.addCleanDashboard();
		}
	}

	addCleanDashboard() {
		this.dashboards = [{
			title : "Untitled Dashboard",
			offset : 0,
			boxes : []
		}]

		this.save();
	}

	addDashboard(title : string, offset = 0) {

		console.log(title, offset);

		if (title.length) {
			let dash = {
				"title" : title,
				"boxes" : [],
				"offset" : Number(offset)
			}

			this.dashboards.push(dash)
			this.save();
		}
	}

	/**
	  * Save settings of the dashboard to localStorage
	  *
	  * TODO: store the settings in DB
	  *
	  * This looks really bad but we can't be sure what is inside localStorage
	  */
	save($event = {}) : void {
		let user = JSON.parse(localStorage.getItem("currentUser"));

		console.log(user);

		if (user['user']['settings'] == null)
			user['user']["settings"] = { "nemea" : { "dashboard" : this.dashboards } };
		else {
			if ('nemea' in user['user']['settings']) {
				if ('dashboard' in user['user']['settings']['nemea']) {
					user['user']["settings"]["nemea"]["dashboard"] = this.dashboards;
				} else {
					user['user']["settings"]["nemea"] = { "dashboard" : this.dashboards };
				}
			} else {
				user['user']["settings"] = { "nemea" : { "dashboard" : this.dashboards } };
			}
		}

		localStorage.setItem("currentUser", JSON.stringify(user));
	}

	/**
	  * Remove a dashboard from dashboard array and save it
	  */
	deleteDashboard(dashboard, $event) {

		$event.preventDefault();

		console.log(this.tabs);
		this.tabs.select('ngb-tab-1');

		let index = this.dashboards.indexOf(dashboard, 0);

		if (index > -1) {
			this.dashboards.splice(index, 1);
			this.save();
		}
	}

	change($event) {
		console.log($event);
	}

}
