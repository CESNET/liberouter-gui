import { Component }	from '@angular/core';
import { Router } from '@angular/router';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { UsersService } from './users.service';

//import { HttpService } from '../../services/index';

@Component({
	selector : 'users',
	template : `<router-outlet></router-outlet>`
})
export class usersComponent {};

@Component({
	selector : 'users-add',
	templateUrl : 'app/modules/users/users-add.html',
	providers : [UsersService]
})
export class usersAddComponent {
	returnUrl = "/users";

	user = {
		first_name : "",
		last_name : "",
		username : "",
		email : "",
		password : "",
		role : 10
	}

	error = "";
	passwordValidation : string = "";

	roles = [
		{value: 0, viewValue: 'Administrator'},
		{value: 10, viewValue: 'User'},
		{value: 255, viewValue: 'Guest'}
	];

	constructor (private usersService: UsersService, private router : Router) {}

	ngOnInit() {
	}

	addUser() {
		// Check if all required fields are set
		// Check password verification
		if ((this.user.username == "" ||
			this.user.email == ""	||
			this.user.password == "" ||
			this.passwordValidation == "") &&
			this.passwordValidation == this.user.password) {
			this.error = "Required fields are missing.";
			return;
		} else {
			this.usersService.add(this.user).subscribe(
			data => {
				// Successfully created user, redirect to users listing
				this.router.navigate([this.returnUrl]);
			},
			error => {
				// Handle error response and display it as error
				let response = JSON.parse(error['_body']);
				this.error = response['message'];
			})
		}
	}
};

@Component({
	selector : 'users-list',
	template : `users-list component to handle everything around users <br />
	<table>
		<tr *ngFor="let user of users">
			<td>{{ user | json }}</td>
		</tr>
	</table>

	<a 	routerLink="add"
			routerLinkActive="active-link">
			Add new user</a>

	`,
	providers : [UsersService]

})
export class usersListComponent {
	users : Array<Object> = [];

	constructor (private usersService : UsersService) {}

	ngOnInit() {
		console.log("trying to list users")
		this.usersService.list().subscribe(
			data => {
				console.log(data);
				this.users = data;
			},
			error => {
				console.log(error)
			}
		);
	}

};
