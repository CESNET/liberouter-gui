import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { User } from './user.component';
import { AuthService } from '../services/index';


@Component({
  selector: 'home',
  templateUrl: 'app/components/home.html',
  providers : [AuthService],

})
export class Home {
	modules : Array<Object> = [];

	constructor(private router : Router) {
	}

	ngOnInit() {
		// Inspect all available routes and find all modules
		for(let route of this.router.config ) {
			if (route.data && route.data['name']) {
				route.data['path'] = route.path;
				this.modules.push(route.data);
			}
		}
	}
}

