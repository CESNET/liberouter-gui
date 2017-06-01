import { Component, OnInit, Input, ViewChild, AfterViewInit } from '@angular/core';

import { BoxService } from '../box.service';
import * as nv from 'nvd3';


@Component({
  selector: 'dash-box',
  templateUrl: './dash-box.component.html',
  styleUrls: ['./dash-box.component.scss'],
  providers : [BoxService]
})
export class DashBoxComponent {

	@Input() box;
	@ViewChild('chart') chart;

	private data = [ { "key": [ "Hello" ], "x:": 10 }, { "key": [ "Hello2" ], "x:": 20 } ];

	constructor(private boxService : BoxService) {
		window.onresize = null;
	}

	ngOnInit() {
		delete this.box.data;
//		console.log(this.box.data);
		this.timeShift();
		console.log("should get data from", this.box.beginTime)

		this.boxService.aggregate(this.box).subscribe(
			(data) => {
				console.debug("Getting data");
				//this.data = data;
				//this.data = [{"key" : ["Hello"], "x:" : 10}]
				console.log(data);
				//setTimeout(_ => { this.data = data }, 100);
				//console.log(data);
				//console.log(this.chart["ngNvD3"])
				//this.chart["ngNvD3"].clearElement();
				//this.chart["ngNvD3"].isViewInitialize(false);
				//this.chart["ngNvD3"]["chart"].update()//WithData(this.box.data, this.box.options);
			},
			(err) => {
				console.error(err);
			}
		);
	}

	/**
	  * Set beginTime and endTime in given box of the period size
	  *
	  * These times serve as a window in which to look in the events.
	  * period is the size of time window
	  */
	timeShift() {
		let now = new Date();

        this.box.beginTime = Math.floor((now.getTime() - (this.box["period"]*60*60*1000))/1000);
        this.box.endTime = Math.floor(Number(now)/1000);
    }


}
