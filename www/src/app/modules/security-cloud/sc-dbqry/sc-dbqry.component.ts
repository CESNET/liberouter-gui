// Global modules
import { Component, Input, OnInit } from '@angular/core';

// Local modules
import { ProfileMap } from '../modules/Profile';
import { TimeSelection } from '../modules/TimeSpecs';

@Component({
  selector: 'sc-dbqry',
  templateUrl: './sc-dbqry.component.html',
  styleUrls: ['./sc-dbqry.component.scss']
})
export class ScDbqryComponent implements OnInit {
	/* EXTERNAL VARIABLES */
	@Input() profiles: ProfileMap;
	@Input() selectedProfile: string;
	@Input() sel : TimeSelection;
	
	/* INTERNAL VARIABLES */
	limitto = [
		{value: "-l 10", desc: "10 records"},
		{value: "-l 20", desc: "20 records"},
		{value: "-l 50", desc: "50 records"},
		{value: "-l 100", desc: "100 records"},
		{value: "-l 200", desc: "200 records"},
		{value: "-l 500", desc: "500 records"},
		{value: "-l 1000", desc: "1000 records"},
		{value: "-l 2000", desc: "2000 records"},
		{value: "-l 5000", desc: "5000 records"},
		{value: "-l 10000", desc: "10000 records"}
	];
	selectedLimit : string = "-l 10"; ///< Selection index to limitto
	
	constructor() { }

	ngOnInit() {
	}
}
