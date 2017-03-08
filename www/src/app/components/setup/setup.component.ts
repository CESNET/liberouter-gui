import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-setup',
  templateUrl: './setup.component.html',
  styleUrls: ['./setup.component.scss']
})
export class SetupComponent implements OnInit {

	admin : Object = {
		username : "",
		password : "",
		password2 : ""
	};

	constructor() { }

	ngOnInit() {
	}

	onSubmit() {
		console.log(this.admin)
	}

}
