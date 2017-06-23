import { Component, Input, OnInit, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { EventDetailComponent } from '../event-detail/event-detail.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: '[nemea-event]',
  templateUrl: './event-item.component.html',
  styleUrls: ['./event-item.component.scss']
})
export class EventItemComponent implements OnInit {
    enableSub = false;
    modalRef: any;
    params: any;

    @Input() item: Object;

    constructor(private modalService: NgbModal, private router: Router, private route: ActivatedRoute) { }

    ngOnInit() {

        this.route.queryParams.subscribe(
            params => {
                this.params = params;

                if (this.params['id'] &&
                        this.params['id'] === this.item['_id']['$oid'] &&
                        !this.modalRef) {
                    this.modalRef = this.modalService.open(EventDetailComponent);
                    this.modalRef.componentInstance.data = this.item;
                    this.modalRef.result.then(
                        (result) => {
                            // The modal was closed and we shall redirect
                            if (result !== undefined) {
                                console.log('should redirect', result);
                                this.router.navigate(result);
                            } else {
                                this.unsetId(this.router, this.params)
                            }
                        },
                        (reason) => {
                            // dismissal
                            this.unsetId(this.router, this.params)
                        });
                }
        });
    }

    /*
     * Unset queryParams from URL
     */
    unsetId(r: Router, params: any) {
        const p = JSON.parse(JSON.stringify(params));
        p['id'] = undefined;
        r.navigate(['nemea/events'], {queryParams : p});
    }
}
