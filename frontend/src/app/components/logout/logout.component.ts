import { Component, OnInit } from '@angular/core';
import { AuthService } from 'app/services';
import { Router } from '@angular/router';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.css'],
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
                    console.log('Success logging out.');
                    localStorage.removeItem('user');
                    localStorage.removeItem('session');
                    this.router.navigate([this.returnUrl]);
                },
                error => {
                    console.log('Error logging out.');
                    localStorage.removeItem('user');
                    localStorage.removeItem('session');
                    this.router.navigate([this.returnUrl]);
                }
            );
    }

}
