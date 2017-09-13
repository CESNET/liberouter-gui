import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { UsersService } from '../users.service';

@Component({
    selector: 'users-add',
    templateUrl: './users-add.component.html',
    styleUrls: ['./users-add.component.scss'],
    providers : [UsersService]
})
export class UsersAddComponent implements OnInit {

    returnUrl = '/users';

    // Default user model
    user = {
        first_name : '',
        last_name : '',
        username : '',
        email : '',
        password : '',
        role : 10
    }

    // Default role model
    roles = [
        {value: 0, viewValue: 'Administrator'},
        {value: 10, viewValue: 'User'},
        {value: 255, viewValue: 'Guest'}
    ];

    error = '';
    // Store password from validation
    passwordValidation = '';

    constructor(private usersService: UsersService,
                 private router: Router) {}

    ngOnInit() {
    }

    addUser() {
        // Check if all required fields are set
        // Check password verification
        if ((this.user.username === '' ||
            this.user.email === ''   ||
            this.user.password === '' ||
            this.passwordValidation === '') &&
            this.passwordValidation === this.user.password) {
            this.error = 'Required fields are missing.';
            return;
        } else {
            this.usersService.add(this.user).subscribe(
            data => {
                // Successfully created user, redirect to users listing
                this.router.navigate([this.returnUrl]);
            },
            error => {
                // Handle error response and display it as error
                const response = JSON.parse(error['_body']);
                this.error = response['message'];
            })
        }
    }
}
