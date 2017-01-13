import { Component } from '@angular/core';
import { LoginBox } from './components/login.component';

@Component({
	selector: 'my-app',
	template: `<router-outlet></router-outlet>`
})
export class AppComponent  { name = 'Angular'; }
