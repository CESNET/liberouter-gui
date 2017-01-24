import { Component }	from '@angular/core';

@Component({
	selector : 'dummy',
	template : `dummy component`
})
export class dummyComponent {
	ngOnInit() {
		console.log("Hello from dummy component");
		}

	getName() {
		return "I am Dummy Comp!";
		}

};
