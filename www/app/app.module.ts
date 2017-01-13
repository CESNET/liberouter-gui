import { NgModule }			from '@angular/core';
import { RouterModule }		from '@angular/router';
import { Routes }			from '@angular/router';
import { BrowserModule }	from '@angular/platform-browser';
import { FormsModule }		from '@angular/forms';
import { MaterialModule }   from "@angular/material";
import { FlexLayoutModule } from "@angular/flex-layout";

import { AppComponent }  from './app.component';
import { LoginBox }  from './components/login.component';
import { UserToolbar }  from './components/toolbar.component';
import { Home }  from './components/home.component';
import { NullComponent }  from './components/null.component';

const appRoutes: Routes = [
	{
		path : 'login',
		component : LoginBox
	},
	{
		path: '',
		component: Home
		},
	{
		path: 'heroes',
		component: NullComponent
	},

	{
		path: '**',
		component: NullComponent
	}
];

@NgModule({
	imports : [
		BrowserModule,
		FormsModule,
		MaterialModule.forRoot(),
		FlexLayoutModule.forRoot(),
		RouterModule.forRoot(appRoutes)
	],
	declarations : [
		AppComponent,
		LoginBox,
		NullComponent,
		UserToolbar,
		Home
	],
	bootstrap : [
		AppComponent
	]
})
export class AppModule { }
