import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'app/services';
import { AppConfigService } from 'app/services/app-config.service';

@Component({
  selector: 'app-setup',
  templateUrl: './setup.component.html',
  styleUrls: ['./setup.component.scss'],
  providers : [AuthService]
})
export class SetupComponent implements OnInit {

    // Default color theme is set to prevent errors before the actual config is loaded.
    private config: object = {
        "colorTheme": {
            "colorMain": "#313747",
            "colorHighlight": "#717787",
            "colorSelected": "#575d6d",
            "colorSelected2": "#b0b6c6",
            "colorBackground": "#fafafa",
            "colorText": "#111",
            "colorTextInverse": "#fff",
            "colorLink": "#111",
            "colorLinkHover": "#333",
            "colorHeading": "#555"
        }};

    admin = {
        username : '',
        password : '',
        password2 : ''
    };

    error = '';

    constructor(private authService: AuthService, private router: Router, private appConfig: AppConfigService) { }

    ngOnInit() {
        this.appConfig.get().subscribe(data => {
            this.config = data;
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
