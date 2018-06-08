import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from 'app/services';
import { AppConfigService } from 'app/services/app-config.service';

import { hooks } from '../../modules';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers : [AuthService]
})
export class LoginComponent implements OnInit {

    loading = false;
    loginBtn = 'Login';
    user = {
        id : '',
        username : '',
        password : '',
        email : ''
    };
    formError = false;
    formErrorMsg = '';
    returnUrl: String;
    logo;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private authService: AuthService,
        public appConfig : AppConfigService) {}

    ngOnInit() {
        this.appConfig.get().subscribe(data => {
            this.logo = {
                src : data['logo'],
                alt : data['name']
            };
            if ('authorization' in data) {
                console.log(data['authorization']);
                this.appConfig.auth = data['authorization'];
                localStorage.setItem('auth', String(data['authorization']));
            } else {
                this.appConfig.auth = true;
                localStorage.setItem('auth', 'true')
            }
        });
        // fetch the return URL and use it if set
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

        // check if the user is logged in and if so redirect them to HP
        const session = localStorage.getItem('session');

        this.authService.checkSession().subscribe(
            data => { this.router.navigate([this.returnUrl]) },
            error => {
                if (this.appConfig.auth) {
                    console.error('Invalid session')
                } else {
                    /* autologin with anonymous account */
                    this.authService.login('anonymous', 'anonymous')
                        .subscribe(
                            data => {
                                this.unsetError();
                                this.router.navigate([this.returnUrl]);
                            },
                            error => {
                                if (error.status > 499) {
                                    this.setError('Can\'t connect to server.');
                                    return;
                                }
                                try {
                                    const body = JSON.parse(error['_body']);
                                    this.setError(body['message']);
                                } catch (err) {
                                    console.log(err);
                                    this.setError('Error logging in.');
                                }
                            }
                        );
                }
            }
        )
    }

    setError(msg: string) {
        this.formError = true;
        this.formErrorMsg = msg;
        this.loading = false;
        this.loginBtn = 'Login';
    }

    unsetError() {
        this.formError = false;
        this.formErrorMsg = '';
        this.loading = false;
        this.loginBtn = 'Login';
    }

    login() {
        // Authenticate the user and redirect them
        this.loading = true;
        this.loginBtn = 'Loading...';

        if (this.user.username === '' || this.user.password === '') {
            this.setError('Missing username or password');
            return;
        }

        this.authService.login(this.user.username, this.user.password)
            .subscribe(
                data => {
                    this.unsetError();
                    /* perform modules' hooks */
                    for (let constr of hooks) {
                        let hook = new constr();
                        if (typeof hook['login'] === 'function') {
                            hook.login();
                        }
                    }
                    /* open application */
                    this.router.navigate([this.returnUrl]);
                },
                error => {
                    if (error.status > 499) {
                        this.setError('Can\'t connect to server.');
                        return;
                    }
                    try {
                        // Correct JSON response formatting
                        let errMessage= error.error.replace(/'/g,'"');
                        errMessage = errMessage.replace("True","true");
                        errMessage = errMessage.replace("False", "false");

                        const body = JSON.parse(errMessage);
                        this.setError(body['message']);
                    } catch (err) {
                        console.log(err);
                        this.setError('Error logging in.');
                    }
                }
            );
    }
}
