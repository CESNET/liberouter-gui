import { Component } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';

@Component({
	selector: 'toolbar-home',
	templateUrl: 'app/components/toolbar.html'
})
export class UserToolbar {
	user =  { user : {username : ""}};
	hide : Boolean = false;

	constructor(private router : Router, private route : ActivatedRoute) {}

	ngOnInit() {
		this.router.events.subscribe(val => {

			/* the router will fire multiple events */
			/* we only want to react if it's the final active route */
			if (val instanceof NavigationEnd) {

				/* the variable curUrlTree holds all params, queryParams, segments and fragments from the current (active) route */
				//let curUrlTree = this.router.parseUrl(this.router.url);
				//console.info(curUrlTree);
				console.info(this.router.url);
				this.user = JSON.parse(localStorage.getItem('currentUser'));

				if (!this.user) {
					this.hide = true;
					this.user = { user : {username : ""}};
					this.router.navigate(['/login']);
				} else {
					this.hide = false;
				}
			}
		});
		//console.log(this.route.pathFromRoot)
		//this.user = JSON.parse(localStorage.getItem('currentUser'));

	}

	logout() {
		this.router.navigate(['/logout']);
	}
}

