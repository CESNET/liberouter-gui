import { Component }	from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
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
	//moduleId : module.id.replace("/dist/", "/"),
	selector : 'users-add',
	templateUrl : './users-add.html',
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
	template : `
	<h2>Users management</h2>
	<section class="box d-flex flex-row">
		<table class="table table-hover">
			<thead>
			<tr>
				<th>Username</th>
				<th>E-mail</th>
				<th>First Name</th>
				<th>Last Name</th>
				<th>Role</th>
				<th>Action</th>
			</tr>
			</thead>
			<tbody>
			<tr *ngFor="let user of users">
				<td>{{ user.username }}</td>
				<td>{{ user.email }}</td>
				<td>{{ user.first_name }}</td>
				<td>{{ user.last_name }}</td>
				<td>{{ user.role }}</td>
				<td>
					<button class="btn btn-secondary"routerLink="{{user.id.$oid}}">View user</button>
					<button class="btn btn-danger" title="Remove user" (click)="removeUser(user)"
					*ngIf="currentUser.user.username != user.username">Delete user</button>
				</td>
			</tr>
			</tbody>
			<tfoot>
				<tr>
					<td colspan="5"><button type="button" class="btn btn-primary" routerLink="add" routerLinkActive="active-link">Add new user</button>
					<td>
				</tr>
			</tfoot>
		</table>
	</section>

		`,
	providers : [UsersService]

})
export class usersListComponent {
	users : Array<Object> = [];
	currentUser = JSON.parse(localStorage.getItem('currentUser'));

	constructor (private usersService : UsersService) {}

	ngOnInit() {
		console.log("trying to list users")
		this.listUsers();
	}

	private listUsers() {
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

	removeUser(user:Object) {
		console.log(user['id']['$oid']);
		this.usersService.remove(user['id']['$oid']).subscribe(
			data => {
			console.log(data);
			this.listUsers();
			},
			error => {
				console.log(error);
			}
		)
	}

};

@Component({
	//moduleId : module.id.replace("/dist/", "/"),
	selector : 'edit-user',
	templateUrl : './users-edit.html',
	providers : [UsersService]
})
export class usersEditComponent {
	userId : String;
	error : String;
	passwordValidation = "";
	user : Object = {
		first_name : "",
		last_name : "",
		username : "",
		email : "",
		password : "",
		role : -1
	}
	user_original : Object;

	roles = [
		{value: 0, viewValue: 'Administrator'},
		{value: 10, viewValue: 'User'},
		{value: 255, viewValue: 'Guest'}
	];

	constructor(private usersService : UsersService, private route : ActivatedRoute, private router : Router) {}

	ngOnInit() {
		this.route.params.subscribe(data => {
			this.userId = data['id'];

			this.usersService.get(this.userId).subscribe(
				(data : Object) => {
					console.log(data);
					this.user = data;
					this.user_original = JSON.parse(JSON.stringify(data));
				},
				error => {
					console.log(error);
					this.error = "This user doesn't exist";
				}
			);
			//console.log(this.userId;)
		});
	}

	updateUser() {
		// Create a diff between user and user_original
		let diff_user : Object = {};
		for (var key in this.user) {
			if (key != "_id" && key != 'settings' &&
				this.user_original[key] != this.user[key])
			{
				diff_user[key] = this.user[key]
			}
		}

		// Update only if there is something to update
		if (Object.keys(diff_user).length > 0) {
			this.usersService.update(this.userId, diff_user).subscribe(
				data => {
					this.router.navigate(['/users']);
				},
				error => {
					console.log(error);
					this.error = "Something went wrong";
				});
		}
	}
}
