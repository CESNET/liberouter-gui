import { Component, OnInit } from '@angular/core';

import { NgGrid, NgGridItem, NgGridConfig, NgGridItemConfig, NgGridItemEvent } from 'angular2-grid';
import { NgbDropdown } from '@ng-bootstrap/ng-bootstrap';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { UsersService } from 'app/modules/users/users.service';

import { DashItemComponent } from './dash-item/dash-item.component';

interface Box {
	id : number;
	/**
	  * Configuration of the box itself
	  */
	config : any;
	/**
	  * Title of the box
	  */
	title : string;
	/**
	  * Content which to display below data
	  */
	content : string;
	/**
	  * Define type of the box
	  * Value: chart|top|number
	  */
	type : string;
	/**
	  * Options for the graph
	  */
	options : Object;
	data : any;
	beginTime : number;
	endTime : number;
	period : number;
	metric : string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  providers : [ UsersService ]
})
export class DashboardComponent implements OnInit {

	private piechart = {
		refreshDataOnly : true,
        chart: {
            type: 'pieChart',
            //height: 375,
            x: function(d) {
            	return d.key;
            },
            y: function(d) {
	            return d.x;
            },
            //showLabels: false,
            //donut : true,
            //padAngle : 0.00,
            //cornerRadius : 1,
            //transitionDuration: 500,
            //labelThreshold: 0,
            //useInteractiveGuideline: true,
            //legend: {
            //    margin: {
            //        top: 5,
            //        right: 0,
            //        bottom: -15,
            //        left: 0
            //    }
            //},
            //legendPosition : "top",
            /*tooltipContent : function(key, x, y, e, graph) {
                                console.log(key);
                                console.log(y);
                                console.log(e);
                                console.log(graph);
                                return 'Hello';
                             },*/
            /*pie : {
                dispatch: {
                    elementClick: function(e) {
                        var date = new Date();
                        console.log(e)
                        date.setTime(date.getTime() - 1000*60*60*24);
                        date.setHours(0);
                        date.setMinutes(0);
                        window.location.href = '#/events?filter&date=' + date.getTime() + '&from=' + new Date().getHours() + ':' + new Date().getMinutes() + '&category=' + e.data.key[0]
                    },
                },
                labelType : "percent",
                labelsOutside : false,
			},*/
			callback : () => {
				console.log("hello");
			}
        }
	}


	private boxes : Array<Box> = [];

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
		'col_width': 200,
		'row_height': 200,
		'cascade': 'left',
		'min_width': 100,
		'min_height': 100,
		'fix_to_grid': false,
		'auto_style': true,
		'auto_resize': false,
		'maintain_ratio': false,
		'prefer_new': false,
		'zoom_on_drag': false,
		'limit_to_screen': true
	};

	private user : Object;
	private modalRef : any;

	config = { 'dragHandle': '.handle', 'col': 1, 'row': 1, 'sizex': 2, 'sizey': 2 };

	constructor(private usersService : UsersService,
			   private modalService: NgbModal) {}

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
				'sizex': 2,
				'sizey': 2
			},
			title : "New Box",
			content : "",
			options : this.piechart,
			type : "piechart",
			data : [],
			beginTime : -1,
			endTime : -1,
			period : 240,
			metric : "Category"
		}

		this.boxes.push(box);

		// Save the new box to local storage
		this.save();

	}

	addBox(box : Box) {
		this.boxes.push(box);
	}

	save() : void {
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
	  * Trigger a modal window which can edit the given box
	  */
	editBox(box : Object) {
		console.debug("Should edit box");
		this.modalRef = this.modalService.open(DashItemComponent);
		this.modalRef.componentInstance.data = box;
	}

	deleteBox(box, i) {
		console.log("should delete: ", box, i);

		let index = this.boxes.indexOf(box, 0);

		if (index > -1) {
			this.boxes.splice(index, 1);
			this.save();
		}
	}

	/**
	  * Duplicates given box and adds it to boxes array
	  *
	  * TODO: this causes an exception when not in production mode
	  */
	duplicateBox(box : Box) {
		let newbox = Object.assign({}, box);
		newbox["title"] = "Duplicate of " + box["title"];
		this.addBox(newbox);
	}

	loadData(box : Box) {
		console.log(box);
	}
}
