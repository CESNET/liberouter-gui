import { Component } from '@angular/core';

@Component({
	selector : 'nemea',
	template : `<router-outlet></router-outlet>`
})
export class nemeaBase {};

@Component({
	moduleId : module.id.replace("/dist/", "/"),
	selector : 'nemea-view',
	template : `
	<h2>
		<a routerLink='status'>
			<md-icon>keyboard_arrow_right</md-icon> Nemea Status
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
