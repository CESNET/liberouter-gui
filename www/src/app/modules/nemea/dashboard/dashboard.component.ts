import { Component, OnInit } from '@angular/core';

import {NgGrid, NgGridItem, NgGridConfig, NgGridItemConfig, NgGridItemEvent} from 'angular2-grid';
import { NgbDropdown } from '@ng-bootstrap/ng-bootstrap';  

interface Box {
	id : number;
	config : any;
	title : string;
	content : string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

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
		'cascade': 'up',
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

	config = { 'dragHandle': '.handle', 'col': 1, 'row': 1, 'sizex': 2, 'sizey': 2 };

	constructor() {}

	ngOnInit() {
		this.boxes.push({
			id : 0,
			config : {
				'dragHandle': '.handle',
				'sizex': 2,
				'sizey': 2
			},
			title : "New Box",
			content : "Newly new box"
		});
	}

	addBox() {
		console.log("should add box");

		this.boxes.push({
			id : 0,
			config : {
				'dragHandle': '.handle',
				'sizex': 2,
				'sizey': 2
			},
			title : "New Box",
			content : "Newly new box"
		});
	}

}
