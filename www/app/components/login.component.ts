import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
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
	returnUrl : String;

	constructor(
		private route : ActivatedRoute,
		private router : Router,
		private authService: AuthService) {}

	ngOnInit() {
		// fetch the return URL and use it if set
		this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

		// check if the user is logged in and if so redirect them to HP
		let lsUser = JSON.parse(localStorage.getItem("currentUser"));

		if (lsUser != null && lsUser['session_id']) {
			this.user = lsUser;
			this.router.navigate([this.returnUrl]);
		}
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
					this.unsetError();
					this.router.navigate([this.returnUrl]);
				},
				error => {
					if (error.status != 401) {
						this.setError("Can't connect to server.");
						return;
					}
					let body = JSON.parse(error['_body']);
					this.setError(body['message'] || "Error logging in.");
				}
			);
	}
}
