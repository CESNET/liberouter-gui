import { Component } from '@angular/core';

@Component({
	selector : 'nemea',
	template : `<router-outlet></router-outlet>`
})
export class nemeaBase {};

@Component({
	//moduleId : module.id.replace("/dist/", "/"),
	selector : 'nemea-view',
	template : `
	<h2>
		<a routerLink='status'>
			<i class="fa fa-chevron-right" aria-hidden="true"></i> Nemea Status
		</a>
	</h2>
	`
})
export class nemeaComponent {
	constructor() {}

	ngOnInit() {
		console.log('Hello from Nemea')
	}
}
