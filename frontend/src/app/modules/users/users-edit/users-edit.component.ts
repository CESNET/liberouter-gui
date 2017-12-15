import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { UsersService } from '../users.service';

@Component({
    selector: 'app-users-edit',
    templateUrl: './users-edit.component.html',
    styleUrls: ['./users-edit.component.scss'],
    providers : [UsersService]
})
export class UsersEditComponent implements OnInit {
    userId: String;
    error: String;
    passwordValidation = '';
    user: Object = {
        first_name : '',
        last_name : '',
        username : '',
        email : '',
        password : '',
        role : -1
    }
    user_original: Object;

    roles = [
        {value: 0, viewValue: 'Administrator'},
        {value: 10, viewValue: 'User'},
        {value: 255, viewValue: 'Guest'}
    ];

    constructor(private usersService: UsersService,
                private route: ActivatedRoute,
                private router: Router) {}

    ngOnInit() {
        this.route.params.subscribe(params => {
            this.userId = params['id'];

            this.usersService.get(this.userId).subscribe(
                (data: Object) => {
                    console.log(data);
                    this.user = data;
                    this.user_original = JSON.parse(JSON.stringify(data));
                },
                error => {
                    console.log(error);
                    this.error = 'This user doesn\'t exist';
                }
            );
        });
    }

    updateUser() {
        // Create a diff between user and user_original
        const diff_user: Object = {};
        for (const key in this.user) {
            if (key !== '_id' &&
                key !== 'settings' &&
                this.user_original[key] !== this.user[key]) {
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
                    this.error = 'Something went wrong';
                });
        }
    }
}
