import { Component, OnInit, Input, Output, ViewChild, EventEmitter } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DashBoxModalComponent } from '../dash-box-modal/dash-box-modal.component';


import { BoxService } from '../box.service';
import { Box } from '../box';

/**
  * Dashboard Box component
  *
  * It encapsulates a box which can of several types:
  *     - piechart
  *     - barchart
  *     - sum
  *     - top
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
export class DashBoxComponent implements OnInit {

    @Input() box;

    // Keeps the original model
    private backup;

    @Input() index;

    // Time offset
    @Input() offset = 0;

    /**
      * We use event emitter for parent interaction which holds the boxes array
      *
      * It might look that this should be in the dashboard component but
      * this component really operates only on itself.
      */
    @Output() onDelete = new EventEmitter<Object>();
    @Output() onDuplicate = new EventEmitter<Object>();
    @Output() onSave = new EventEmitter<Object>();

    @ViewChild('piechart')
    private piechart;

    @ViewChild('areachart')
    private areachart;

    private data = [];
    private modalRef: any;

    constructor(private boxService: BoxService,
               private modalService: NgbModal) {
    }

    /**
      * Shift time and fetch data on init
      */
    ngOnInit() {
        // Shift time for fetching correct data
        this.timeShift();

        switch (this.box.type) {
            case 'piechart':
                // Fetch data
                this.boxService.piechart(this.box).subscribe(
                    (data) => { this.data = data },
                    (err) => { console.error(err) }
                );
                break;
            case 'barchart':
                // Fetch data
                this.boxService.barchart(this.box).subscribe(
                    (data) => { this.data = data; this.processDates(); },
                    (err) => { console.error(err) }
                );
                break;

            case 'count':
                this.boxService.count(this.box).subscribe(
                    (data) => { this.data = data },
                    (err) => { console.error(err) }
                );
                break;

            case 'top':
                this.boxService.top(this.box).subscribe(
                    (data) => { this.data = data },
                    (err) => { console.error(err) }
                );
                break;

            default:
                console.warn('unknown type \'%s\'', this.box.type);
                break;
        }
    }

    /**
      * Set beginTime and endTime in given box of the period size
      *
      * These times serve as a window in which to look in the events.
      * period is the size of time window
      */
    timeShift() {
        const now = new Date();

        this.box.beginTime = Math.floor((now.getTime() - this.box['period']*60*60*1000 - this.offset * 60 * 60 * 1000)/1000);
        this.box.endTime = Math.floor((Number(now) - this.offset * 60 * 60 * 1000)/1000);
    }

    /**
      * Convert dates to Date class so ngx charts can detect it is a date
      * and create the timeline below a chart
      */
    processDates() {
        this.data = this.data.map(category => {
            category.series = category.series.map(item => {
                item.date = item.name;
                item.name = new Date(item.name*1000);
                return item;
            })

            return category;
        })
    }

    /**
      * Custom format of X axis ticks
      * unfortunately it cannot display hours/minutes becuase ngx sends just date
      */
    xAxis = function(d) {
        const day = d.getDate();
        const month = d.getMonth();
        const hours = d.getHours();
        const minutes = d.getMinutes();
        return day + '/' + month;
    };

    /**
      * Update the chart
      * Calls child method update()
      * More info here: https://github.com/swimlane/ngx-charts/blob/master/src/pie-chart/pie-chart.component.ts
      */
    update() {
        console.log(this.piechart);
        console.log(this.areachart);

        if (this.piechart !== undefined) {
            this.piechart.update();
        } else if(this.areachart !== undefined) {
            this.areachart.update();
        }
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

                this.save();

                this.ngOnInit();
            },
            (reason) => {
                // Dismissal of the modal, do nothing
            }
        );
    }

    /**
      * Remove this box from the array of boxes
      */
    remove() {
        this.onDelete.emit({'box' : this.box, 'index' : this.index });
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
        this.update();
        this.save();
    }

    /**
      * Called when onDragStop is emitted to save the change
      */
    itemChange(event) {
        this.update();

        // Must wait with saving, the change is not propagated fash enough
        setTimeout(_ => { this.save() }, 100);
    }

    onSelect(event) {
        console.log(event);
    }
}
