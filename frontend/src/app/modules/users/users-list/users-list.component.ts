import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';

import { UsersService } from '../users.service';

enum Roles {
    'Administrator' = 0,
    'User' = 10,
    'Guest' = 255
}

@Component({
  selector: 'users-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.scss'],
  providers : [UsersService]
})
export class UsersListComponent implements OnInit {

    users: Array<Object> = [];
    currentUser = JSON.parse(localStorage.getItem('user'));
    roles = Roles;
    user = {};
    deleteBtn = ['Delete', 'Cancel'];

    constructor (private usersService: UsersService) {}

    ngOnInit() {
        console.log('trying to list users')
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

    public confirmDelete(user) {
        this.user = user;
    }

    removeUser(user: Object) {
        this.usersService.remove(user['id']).subscribe(
            data => {
                this.listUsers();
            },
            error => {
                console.log(error);
            }
        )
    }

}
