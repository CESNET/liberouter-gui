import { Component, OnInit } from '@angular/core';

@Component({
    selector : 'nemea',
    template : `<router-outlet></router-outlet>`
})
export class NemeaBaseComponent {};

@Component({
    selector : 'nemea-view',
    template : `
    <section class="d-flex flex-row">
        <section class="box">
            <h2>
                <a routerLink='status'>
                    <i class="fa fa-chevron-right" aria-hidden="true"></i> NEMEA Status
                </a>
            </h2>
        </section>
        <section class="box">
            <h2>
                <a routerLink='events'>
                    <i class="fa fa-chevron-right" aria-hidden="true"></i> NEMEA Events
                </a>
            </h2>
        </section>

        <section class="box">
            <h2>
                <a routerLink='dashboard'>
                    <i class="fa fa-chevron-right" aria-hidden="true"></i> NEMEA Dashboard
                </a>
            </h2>
        </section>
        <section class="box">
            <h2>
                <a routerLink='reporters'>
                    <i class="fa fa-chevron-right" aria-hidden="true"></i> NEMEA Reporter Configuration
                </a>
            </h2>
        </section>
    </section>
    `
})
export class NemeaComponent implements OnInit {
    constructor() {}

    ngOnInit() { }
}
