import { Component } from '@angular/core';
import { LoginBox } from './components/login.component';

@Component({
  selector: 'my-app',
  template: `<h1>Hello {{name}}</h1><login-box></login-box>`,
})
export class AppComponent  { name = 'Angular'; }
