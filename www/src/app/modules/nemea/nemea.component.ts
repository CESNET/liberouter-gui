import { Component } from '@angular/core';

@Component({
	selector : 'nemea',
	template : `<router-outlet></router-outlet>`
})
export class nemeaBase {};

@Component({
	selector : 'nemea-view',
	template : `
	<section class="d-flex flex-row">
		<section class="box">
			<h2>
				<a routerLink='status'>
					<i class="fa fa-chevron-right" aria-hidden="true"></i> Nemea Status
				</a>
			</h2>
		</section>
		<section class="box">
			<h2>
				<a routerLink='events'>
					<i class="fa fa-chevron-right" aria-hidden="true"></i> Nemea Events
				</a>
			</h2>
		</section>

		<section class="box">
			<h2>
				<a routerLink='exporters'>
					<i class="fa fa-chevron-right" aria-hidden="true"></i> Nemea Configuration
				</a>
			</h2>
		</section>
	</section>
	`
})
export class nemeaComponent {
	constructor() {}

	ngOnInit() { }
}
