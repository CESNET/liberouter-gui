import { Component } from '@angular/core';

@Component({
	selector: 'toolbar-home',
	templateUrl: 'app/components/toolbar.html'
})
export class UserToolbar {
	user = {};

	constructor() {}

	ngOnInit() {
		this.user = JSON.parse(localStorage.getItem('currentUser'));
		console.log(this.user);
	}
}

