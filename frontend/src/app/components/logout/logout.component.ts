import { Component, OnInit } from '@angular/core';
import { AuthService } from 'app/services';
import { Router } from '@angular/router';

import { hooks } from '../../modules';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: [],
  providers : [AuthService]
})
export class LogoutComponent implements OnInit {
    returnUrl = '/login';

    constructor(
        private router: Router,
        private authService: AuthService) {}

    ngOnInit() {
        this.authService.logout()
            .subscribe(
                data => {
                    /* perform modules' hooks */
                    for (let constr of hooks) {
                        let hook = new constr();
                        if (typeof hook['logout'] === 'function') {
                            hook.logout();
                        }
                    }
                    console.log('Success logging out.');
                    localStorage.removeItem('user');
                    localStorage.removeItem('session_id');
                    this.router.navigate([this.returnUrl]);
                },
                error => {
                    console.log('Error logging out.');
                    localStorage.removeItem('user');
                    localStorage.removeItem('session_id');
                    this.router.navigate([this.returnUrl]);
                }
            );
    }

}
