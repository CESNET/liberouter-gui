import { Component } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { LoginBox } from './components/login.component';

@Component({
	selector: 'my-app',
	template: `
	 <md-sidenav-container>
	<md-sidenav #start
		(open)="closeStartButton.focus()"
		opened="true"
		mode="side"
		*ngIf="!isLoginPage">
	  Start Sidenav.

	  <ul class="menu">
		<li
			class="flex-container"
			fxLayout="column"
			fxLayoutAlign="center center"
			routerLink="/"
			routerLinkActive="active-link"
			[routerLinkActiveOptions]="{exact:true}">
			<md-icon class="flex-item">apps</md-icon>
			<span class="flex-item">Home</span>
		</li>

		<li
			class="flex-container"
			fxLayout="column"
			fxLayoutAlign="center center"
			routerLink="/dummy"
			routerLinkActive="active-link"
			[routerLinkActiveOptions]="{exact:true}">
			<md-icon class="flex-item">apps</md-icon>
			<span class="flex-item">Dummy</span>
		</li>

		</ul>
      <br>
      <!--button md-button #closeStartButton (click)="start.close()">Close</button-->
    </md-sidenav>
<toolbar-home></toolbar-home>

	<router-outlet></router-outlet>
  </md-sidenav-container>
`
})
export class AppComponent  {
	isLoginPage : boolean = false;
	user = {};

	constructor(private router : Router, private route:ActivatedRoute) {}

	ngOnInit() {
		//console.log(this.router.url);

		this.router.events.subscribe(val => {

			/* the router will fire multiple events */
			/* we only want to react if it's the final active route */
			if (val instanceof NavigationEnd) {

				/* the variable curUrlTree holds all params, queryParams, segments and fragments from the current (active) route */
				//let curUrlTree = this.router.parseUrl(this.router.url);
				//console.info(curUrlTree);
				console.info(this.router.url);
				this.user = JSON.parse(localStorage.getItem('currentUser'));

				if (!this.user || this.router.url == "/login") {
					this.isLoginPage = true;
				} else {
					this.isLoginPage = false;
				}
			}
		});

	/*this.router.events.subscribe((event: Event) => {
            console.log(event.url);//this will give you required url
	});*/
	}
}
