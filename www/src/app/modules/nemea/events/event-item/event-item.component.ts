import { Component, Input, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { EventDetailComponent } from '../event-detail/event-detail.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: '[nemea-event]',
  templateUrl: './event-item.component.html',
  styleUrls: ['./event-item.component.scss']
})
export class EventItemComponent implements OnInit {
	enableSub = false;
	modalRef : any;

	@Input() item : Object;

	constructor(private modalService: NgbModal, private router : Router) { }

	ngOnInit() { }

	//@HostListener('click')
	expandRow() {
	this.router.navigate(['nemea/events', {"id" : this.item["_id"]["$oid"]}])
		this.modalRef = this.modalService.open(EventDetailComponent);
		this.modalRef.componentInstance.data = this.item;
	}
}
