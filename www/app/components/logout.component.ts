import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { User } from './user.component';
import { AuthService } from '../services/index';

@Component({
 // selector: 'login-box',
	template: ``,
	providers : [AuthService]
})
export class LogoutComponent {
	returnUrl = "/login";
	user : User;

	constructor(
		private route : ActivatedRoute,
		private router : Router,
		private authService: AuthService) {}

	ngOnInit() {
		this.authService.logout()
			.subscribe(
				data => {
					console.log('Success logging out.');
					localStorage.removeItem("currentUser");
					this.router.navigate([this.returnUrl]);
				},
				error => {
					console.log('Error logging out.');
					localStorage.removeItem("currentUser");
					this.router.navigate([this.returnUrl]);
				}
			);
	}

}
