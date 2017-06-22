import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { NgGrid, NgGridItem, NgGridConfig, NgGridItemConfig, NgGridItemEvent } from 'angular2-grid';

import { Box } from '../box';

@Component({
  selector: 'dashboard-view',
  templateUrl: './dashboard-view.component.html',
  styleUrls: ['./dashboard-view.component.scss']
})
export class DashboardViewComponent implements OnInit {

    @Input() dashboard;
    public boxes;

    @Output() onSave = new EventEmitter<Object>();

    /**
      * Grid configuration taken from: https://github.com/BTMorton/angular2-grid/blob/master/demo-dashboard/app/app.component.ts
      */
    public gridConfig: NgGridConfig = <NgGridConfig>{
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

    constructor() { }

    ngOnInit() {
        this.boxes = this.dashboard['boxes'];
    }

    /**
      * Add default box to boxes array
      */
    addCleanBox() {
        console.log('should add box');

        const box = {
            config : {
                'dragHandle': '.handle',
                'sizex': 10,
                'sizey': 10,
                'col': 1,
                'row': 1,
                'resizeHandle': null,
                'borderSize': 15,
                'fixed': false,
                'draggable': true,
                'resizable': true,
                'payload': null,
                'maxCols': 0,
                'minCols': 0,
                'maxRows': 0,
                'minRows': 0,
                'minWidth': 0,
                'minHeight': 0,
            },
            title : 'New Box',
            content : '',
            options : null,
            type : 'piechart',
            beginTime : -1,
            endTime : -1,
            period : 240,
            metric : 'Category'
        }

        this.boxes.push(box);

        // Save the new box to local storage
        this.save();

    }

    addBox(box: Box) {
        this.boxes.push(box);
    }

    /**
      * Remove a box from boxes array and save it
      */
    deleteBox(box) {
        console.log('should delete: ', box.box, box.index);

        const index = this.boxes.indexOf(box.box, 0);

        if (index > -1) {
            this.boxes.splice(index, 1);
            this.save();
        }
    }

    /**
      * Duplicates given box and adds it to boxes array
      *
      * TODO: this causes the browser to freeze, don't know why
      */
    duplicateBox(box: Box) {
        console.log('duplicating')
        const newbox = Object.assign({}, box);
        newbox['title'] = 'Duplicate of ' + newbox['title'];
        this.boxes.push(newbox);
    }


    save() {
        this.onSave.emit();
    }
}
