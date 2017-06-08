import { Component, OnInit } from '@angular/core';
import { NgGrid, NgGridItem, NgGridConfig, NgGridItemConfig, NgGridItemEvent } from 'angular2-grid';
import { NgbDropdown } from '@ng-bootstrap/ng-bootstrap';

import { UsersService } from 'app/modules/users/users.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  providers : [ UsersService ]
})
export class DashboardComponent implements OnInit {

	private boxes : Array<Box> = [];

	/**
	  * Grid configuration taken from: https://github.com/BTMorton/angular2-grid/blob/master/demo-dashboard/app/app.component.ts
	  */
	private gridConfig: NgGridConfig = <NgGridConfig>{
		'margins': [5],
		'draggable': true,
		'resizable': true,
		'max_cols': 0,
		'max_rows': 0,
		'visible_cols': 0,
		'visible_rows': 0,
		'min_cols': 1,
		'min_rows': 1,
		'col_width': 20,
		'row_height': 20,
		'cascade': 'left',
		'min_width': 5,
		'min_height': 5,
		'fix_to_grid': false,
		'auto_style': true,
		'auto_resize': false,
		'maintain_ratio': false,
		'prefer_new': false,
		'zoom_on_drag': false,
		'limit_to_screen': true
	};

	// LocalStorage currentUser
	private user : Object;

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
			this.boxes = this.user["user"]["settings"]["nemea"]["dashboard"];
		} catch (e) {
			console.log(e);
			this.addCleanBox();
		}
	}

	/**
	  * Add default box to boxes array
	  */
	addCleanBox() {
		console.log("should add box");

		let box = {
			id : 0,
			config : {
				'dragHandle': '.handle',
				'sizex': 10,
				'sizey': 10
			},
			title : "New Box",
			content : "",
			options : null,
			type : "piechart",
			beginTime : -1,
			endTime : -1,
			period : 240,
			metric : "Category"
		}

		this.boxes.push(box);

		// Save the new box to local storage
		this.save({});

	}

	addBox(box : Box) {
		this.boxes.push(box);
	}

	/**
	  * Save settings of the dashboard to localStorage
	  *
	  * TODO: store the settings in DB
	  *
	  * This looks really bad but we can't be sure what is inside localStorage
	  */
	save($event) : void {
		let user = JSON.parse(localStorage.getItem("currentUser"));

		console.log(user);

		if (user['user']['setting'] == null)
			user['user']["settings"] = { "nemea" : { "dashboard" : this.boxes } };
		else {
			if ('nemea' in user['user']['settings']) {
				if ('dashboard' in user['user']['settings']['nemea']) {
					user['user']["settings"]["nemea"]["dashboard"] = this.boxes;
				} else {
					user['user']["settings"]["nemea"] = { "dashboard" : this.boxes };
				}
			} else {
				user['user']["settings"] = { "nemea" : { "dashboard" : this.boxes } };
			}
		}

		localStorage.setItem("currentUser", JSON.stringify(user));
	}

	/**
	  * Remove a box from boxes array and save it
	  */
	deleteBox(box) {
		console.log("should delete: ", box.box, box.index);

		let index = this.boxes.indexOf(box.box, 0);

		if (index > -1) {
			this.boxes.splice(index, 1);
			this.save({});
		}
	}

	/**
	  * Duplicates given box and adds it to boxes array
	  *
	  * TODO: this causes the browser to freeze, don't know why
	  */
	duplicateBox(box : Box) {
		console.log("duplicating")
		let newbox = Object.assign({}, box);
		newbox["title"] = "Duplicate of " + box["title"];
		this.boxes.push(box);
	}
}
