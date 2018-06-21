import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'app/services';
import { AppConfigService } from "app/services/app-config.service";

@Component({
  selector: 'app-setup',
  templateUrl: './setup.component.html',
  styleUrls: ['./setup.component.scss'],
  providers : [AuthService]
})
export class SetupComponent implements OnInit {
    admin = {
        username : '',
        password : '',
        password2 : ''
    };

    error = '';
    name = 'Liberouter GUI'; // Rewritten by AppConfig service

    constructor(private authService: AuthService, private router: Router, private appConfig: AppConfigService) { }

    ngOnInit() {
        this.appConfig.get().subscribe(data => {
            this.name = data['name'];
        });
        this.authService.checkSetup().subscribe((err) => {
            this.checkRedirect(err);
        },
        (err) => {
            this.checkRedirect(err);
        });
    }

    checkRedirect(err: object) {
        if (err['status'] && err['status'] == 404) {
            console.warn('Setup already completed');
            this.router.navigate(['/login']);
        }
    }

    onSubmit() {
        this.authService.admin(this.admin).subscribe(
            data => {
                this.router.navigate(['/login']);
            },
            err => {
                console.log(err);
                // Server returns HTML 404 response, if setup was already completed.
                // This overrides the message with human readable message, instead of [Object object]
                if(err['status'] == 404) {
                    this.error = "Setup was already completed. You can not create new users using setup. (Got 404 when accessing setup)";
                }
                else {
                    this.error = err;
                }
            }
        )
    }

}
