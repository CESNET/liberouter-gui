import { Component } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
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
