import { Component, OnInit } from '@angular/core';

import { UsersService } from '../users.service';

@Component({
  selector: 'users-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.scss'],
  providers : [UsersService]
})
export class UsersListComponent implements OnInit {

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

}
