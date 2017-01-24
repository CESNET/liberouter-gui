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
	modules : {name : string, path : string}[] = [];

	constructor(private router : Router) {
	}

	ngOnInit() {
		// Inspect all available routes and find all modules
		for(let route of this.router.config ) {
			try {
				let tmp = new route.component();
				this.modules.push({
					name : tmp.getName(),
					path : route.path
				});
			} catch (e) {
				console.debug(e);
			}
		}
	}
}

