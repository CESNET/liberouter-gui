import { Injectable } from '@angular/core';
import { CanActivate, Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  CanActivateChild,
  NavigationExtras,
  CanLoad, Route } from '@angular/router';

@Injectable()
export class AuthGuard implements CanActivate, CanLoad {

	constructor(private router: Router) { }

	isLoggedIn() : boolean {
	    if (localStorage.getItem('currentUser')) {
            // logged in so return true
            return true;
        }

        // not logged in so redirect to login page with the return url
        return false;
	}

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        if (this.isLoggedIn()) {
		// logged in so return true
		//console.log(route.data)
			let user = JSON.parse(localStorage.getItem('currentUser'));
			if (route.data['role'] == undefined) {
				console.warn('No role is set for route \'' + route.data['path'] + '\'');
				return true;
			}

			if (user.user.role <= route.data['role']) {
				return true;
			}

			console.warn('User is not allowed to access \'' + route.data['path'] + '\'')
			return false;
        }

        // not logged in so redirect to login page with the return url
        this.router.navigate(['/login'], { queryParams: { returnUrl: state.url }});
        return false;
	}

	canLoad(route : Route) : boolean {
		if (this.isLoggedIn()) {
			return true;
		}
		return false;
	}
}
