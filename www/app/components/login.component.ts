import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { User } from './user.component';
import { AuthService } from '../services/index';

@Component({
  selector: 'login-box',
  templateUrl: 'app/components/login.html',
  providers : [AuthService]
})
export class LoginBox  {
	loading = false;
	user : User = {
		id : "",
		username : "",
		password : "",
		email : ""
	};
	formError = false;
	formErrorMsg = "";

	constructor(
		private router : Router,
		private authService: AuthService) {}

	ngOnit() {
	// TODO: check if the user is logged in and if so redirect them to HP
	}

	setError(msg : string) {
		this.formError = true;
		this.formErrorMsg = msg;
		this.loading = false;
	}

	unsetError() {
		this.formError = false;
		this.formErrorMsg = "";
		this.loading = false;
	}

	login() {
		// Authenticate the user and redirect them
		this.loading = true;

		if (this.user.username == "" || this.user.password == "") {
			this.setError("Missing username or password");
			return;
		}

		this.authService.login(this.user.username, this.user.password)
			.subscribe(
				data => {
					console.log("Success!!!");
					this.unsetError();
					this.router.navigate(['/success']);
				},
				error => {
					let body = JSON.parse(error['_body']);
					this.setError(body['message']);
				}
			);
	}

	logout() {
		this.authService.logout()
			.subscribe(
				data => {
					console.log('Success logging out.');
				},
				error => {
					console.log('Error logging out.');
				}
			);
	}

}
