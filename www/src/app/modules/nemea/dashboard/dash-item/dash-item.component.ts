import { Component, OnInit, Input } from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-dash-item',
  templateUrl: './dash-item.component.html',
  styleUrls: ['./dash-item.component.scss']
})
export class DashItemComponent implements OnInit {

	@Input() data : Object;

	constructor(public activeModal: NgbActiveModal) { }

	ngOnInit() {
	}

}
