import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent }  from './app.component';
import { LoginBox }  from './components/login.component';

@NgModule({
  imports:      [ BrowserModule ],
  declarations: [ AppComponent, LoginBox ],
  bootstrap:    [ AppComponent, LoginBox ]
})
export class AppModule { }
