import { NgModule }			from '@angular/core';
import { RouterModule }		from '@angular/router';
import { Routes }			from '@angular/router';
import { BrowserModule }	from '@angular/platform-browser';
import { FormsModule }		from '@angular/forms';
import { MaterialModule }   from "@angular/material";
import { FlexLayoutModule } from "@angular/flex-layout";

import { AppComponent }  from './app.component';
import { AppRoutingModule } from './app-routing.module';

/** GUARDS **/
import { AuthGuard } from './guards/auth.guard';

/** BASE **/
import { Home }  from './components/home.component';
import { UserToolbar }  from './components/toolbar.component';
import { LogoutComponent }  from './components/logout.component';
import { LoginBox }  from './components/login.component';
import { NullComponent }  from './components/null.component';

/** MODULES **/
import { modules } from './modules';
//import * as Module from './modules/index';


const baseModules : Array<Object> = [
		BrowserModule,
		FormsModule,
		AppRoutingModule,
		MaterialModule.forRoot(),
		FlexLayoutModule.forRoot(),
]

@NgModule({
	imports : [modules, baseModules],
	declarations : [
		AppComponent,
		LoginBox,
		LogoutComponent,
		NullComponent,
		UserToolbar,
		Home
	],
	providers : [
		AuthGuard
	],
	bootstrap : [
		AppComponent
	]
})
export class AppModule { }
