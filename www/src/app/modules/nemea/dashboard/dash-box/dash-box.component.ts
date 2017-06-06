import { Component, OnInit, Input, Output, ViewChild, EventEmitter } from '@angular/core';
import { PieChartComponent } from '@swimlane/ngx-charts';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DashBoxModalComponent } from '../dash-box-modal/dash-box-modal.component';
import { Box } from '../dashboard.component';


import { BoxService } from '../box.service';

/**
  * Dashboard Box component
  *
  * It encapsulates a box which can of several types:
  *		- piechart
  *		- barchart
  *		- sum
  *		- top
  *
  * For displaying charts ngx-charts library is used. Before you say I should
  * use nvd3 it is very buggy in Angular 4 (ng2-nvd3 and angular-nvd3).
  */
@Component({
  selector: 'dash-box',
  templateUrl: './dash-box.component.html',
  styleUrls: ['./dash-box.component.scss'],
  providers : [BoxService]
})
export class DashBoxComponent {

	@Input() box;

	// Keeps the original model
	private backup;

	@Input() index;

	/**
	  * We use event emitter for parent interaction which holds the boxes array
	  *
	  * It might look that this should be in the dashboard component but
	  * this component really operates only on itself.
	  */
	@Output() onDelete = new EventEmitter<Object>();
	@Output() onDuplicate = new EventEmitter<Object>();
	@Output() onSave = new EventEmitter<Object>();

	@ViewChild(PieChartComponent)
	private piechart;

	private data = [];
	private modalRef : any;

	constructor(private boxService : BoxService,
			   private modalService: NgbModal) {
	}

	/**
	  * Shift time and fetch data on init
	  */
	ngOnInit() {
		// Shift time for fetching correct data
		this.timeShift();

		// Fetch data
		this.boxService.aggregate(this.box).subscribe(
			(data) => {
				this.data = data;
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

	/**
	  * Update the chart
	  * Calls child method update()
	  * More info here: https://github.com/swimlane/ngx-charts/blob/master/src/pie-chart/pie-chart.component.ts
	  */
    update() {
    	if (this.piechart != undefined)
			this.piechart.update();
    }

	/**
	  * Trigger a modal window which can edit the given box
	  */
	edit() {
		// Create a backup of current model
		this.backup = Object.assign({}, this.box);

		// Open the modal and check results
		this.modalRef = this.modalService.open(DashBoxModalComponent)
		this.modalRef.componentInstance.data = this.box;
		this.modalRef.result.then(
			(result) => {
				/**
				  * Closed with a button, replace current model with the new one
				  * Also would be nice to reload data
				  */

				// Shift the time
				this.timeShift();
				this.save();

				this.boxService.aggregate(this.box).subscribe(
					(data) => {
						this.data = data;
					},
					(err) => {
						console.error(err);
					}
				);

			},
			(reason) => {
				// Dismissal of the modal, revert backup
				console.debug("Modal dismissed");
				this.box = Object.assign({}, this.backup);
			}
		);
	}

	/**
	  * Remove this box from the array of boxes
	  */
	remove() {
		console.debug("Deleting box");
		this.onDelete.emit({"box" : this.box, "index" : this.index });
	}

	/**
	  * Duplicate this box in the boxes array
	  */
	duplicate() {
		this.onDuplicate.emit(this.box);
	}

	save() {
		this.onSave.emit({});
	}

	resize(event) {
		console.log(event);
		this.update();
	}

	/**
	  * Called when onDragStop is emitted to save the change
	  */
	itemChange(event) {
		this.update();

		// Must wait with saving, the change is not propagated fash enough
		setTimeout(_ => { this.save() }, 100);
	}

}
