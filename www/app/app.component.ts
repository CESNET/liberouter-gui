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

		<h1 class="user-area flex-container"
			fxLayout="row"
			fxLayoutAlign="center center">
			Liberouter
		</h1>

		<div class="user-area flex-container"
			fxLayout="row"
			fxLayoutAlign="center center">

			{{ user.user.username }}

			<button md-icon-button [mdMenuTriggerFor]="menu">
				<md-icon>more_vert</md-icon>
			</button>
			<md-menu #menu="mdMenu" x-position="before" #posXMenu="mdMenu" class="before flex-item">
				<button md-menu-item>
					<md-icon>person</md-icon>
					My Profile </button>
				<button md-menu-item>
					<md-icon>settings</md-icon>
					Settings
				</button>
				<button md-menu-item routerLink="logout"> <md-icon> exit_to_app </md-icon> <span>Sign Out</span> </button>
			</md-menu>
		</div>

	  <ul class="menu">
		<li
			class="flex-container"
			fxLayout="row"
			fxLayoutAlign="center center"
			routerLink="/"
			routerLinkActive="active-link"
			[routerLinkActiveOptions]="{exact:true}">
			<md-icon class="flex-item">apps</md-icon>
			<span class="flex-item">Home</span>
		</li>

		<li
			*ngFor="let module of modules"
			class="flex-container"
			fxLayout="row"
			fxLayoutAlign="center center"
			routerLink="{{module.path}}"
			routerLinkActive="active-link"
			>
			<md-icon class="flex-item">apps</md-icon>
			<span class="flex-item">{{ module.name }}</span>

			<!-- <div *ngIf="router.url == '/' + module.path" class="flex-item">
				<div *ngFor="let child of children">
					<span *ngIf="child.path != ''">
						<span (click)="setPath([module.path,'protected'])">
							{{ child.data.name }}
						</span>
					</span>

				</div>
			</div> -->
		</li>

		</ul>
      <br>
      <!--button md-button #closeStartButton (click)="start.close()">Close</button-->
    </md-sidenav>

	<router-outlet></router-outlet>
  </md-sidenav-container>
`
})
export class AppComponent  {
	isLoginPage : boolean = false;
	user =  { user : {username : ""}};
	modules : Array<Object> = [];
	children : Array<Object>= [];

	constructor(private router : Router, private route:ActivatedRoute) {}

	ngOnInit() {
		//console.log(this.router.url);

		this.router.events.subscribe(val => {

			/* the router will fire multiple events */
			/* we only want to react if it's the final active route */
			if (val instanceof NavigationEnd) {
				/* the variable curUrlTree holds all params, queryParams, segments and fragments from the current (active) route */
				this.user = JSON.parse(localStorage.getItem('currentUser'));

				if (!this.user || this.router.url == "/login") {
					this.isLoginPage = true;
					this.user = { user : {username : ""}};
					this.router.navigate(['/login']);
				} else {
				this.isLoginPage = false;

					console.log(this.route.children)

					this.children = this.route.children[0].routeConfig.children;
				}
			}
		});

		this.getModules();
	}

	getModules() {
		for(let route of this.router.config ) {
			if (route.data && route.data['name']) {
				route.data['path'] = route.path;
				this.modules.push(route.data);
			}
		}
	}

	setPath(path : Array<String>) {
		this.router.navigate(path);
	}
}
