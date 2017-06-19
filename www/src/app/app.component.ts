import { Component } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { AuthService, ConfigService } from './services';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers : [AuthService, ConfigService]
})
export class AppComponent {
	isLoginPage : boolean = false;
	user =  { user : {username : ""}};
	modules : Array<Object> = [];
	children : Array<Object>= [];

	constructor(private router : Router,
				private route:ActivatedRoute,
				private auth : AuthService,
				private config : ConfigService) {}

	ngOnInit() {
		this.config.load();
		this.router.events.subscribe(val => {
			/* the router will fire multiple events */
			/* we only want to react if it's the final active route */
			if (val instanceof NavigationEnd) {
				/* the variable curUrlTree holds all params, queryParams, segments and fragments from the current (active) route */
				if (this.router.url == "/setup") {
					this.isLoginPage = true;
				}
				else if (this.router.url == "/login") {
					this.isLoginPage = true;
					this.logout();
				} else {
					this.checkSession();
					this.isLoginPage = false;
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

	private checkSession() {
		this.user = JSON.parse(localStorage.getItem('currentUser'));

		if (!this.user) {
			this.logout();
			return;
		}

		console.info("I should check the session: " + this.user["session_id"]);
		this.auth.checkSession().subscribe(
			data => {},
			error => {
				console.log(error.status)
				console.error("The session \"" + this.user["session_id"] + "\" is invalid");
				this.logout();
			}
		)
	}

	private logout() {
		localStorage.removeItem("currentUser");
		this.user = { user : {username : ""}};
		this.router.navigate(['/login']);
	}
}
