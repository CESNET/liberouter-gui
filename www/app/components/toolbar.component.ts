import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
	selector: 'toolbar-home',
	templateUrl: 'app/components/toolbar.html'
})
export class UserToolbar {
	user = {};

	constructor(private router : Router) {}

	ngOnInit() {
		this.user = JSON.parse(localStorage.getItem('currentUser'));
	}

	logout() {
		this.router.navigate(['/logout']);
	}
}

