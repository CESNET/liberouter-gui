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
    }

    onSubmit() {
        this.authService.admin(this.admin).subscribe(
            data => {
                this.router.navigate(['/login']);
            },
            err => {
                console.log(err);
                this.error = err;
            }
        )
    }

}
