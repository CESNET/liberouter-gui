import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'app/services';

@Component({
  selector: 'app-setup',
  templateUrl: './setup.component.html',
  styleUrls: ['./setup.component.scss'],
  providers : [AuthService]
})
export class SetupComponent implements OnInit {

    admin: Object = {
        username : '',
        password : '',
        password2 : ''
    };

    error = '';

    constructor( private authService: AuthService
               , private router: Router
               ) { }

    ngOnInit() {
    }

    onSubmit() {
        this.authService.admin(this.admin).subscribe(
            data => {
                this.router.navigate(['/login']);
            },
            err => {
                this.error = err;
            }
        )
    }

}
