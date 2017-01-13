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
ngOnInit() {
		console.log("hello oninit");
	}

}

