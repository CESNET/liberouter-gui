import { NgModule }			from '@angular/core';
import { RouterModule }		from '@angular/router';
import { Routes }			from '@angular/router';
import { BrowserModule }	from '@angular/platform-browser';
import { FormsModule }		from '@angular/forms';
import { MaterialModule }   from "@angular/material";
import { FlexLayoutModule } from "@angular/flex-layout";

import { AppComponent }  from './app.component';
import { AuthGuard } from './guards/auth.guard';
import { LoginBox }  from './components/login.component';
import { LogoutComponent }  from './components/logout.component';
import { UserToolbar }  from './components/toolbar.component';
import { Home }  from './components/home.component';
import { NullComponent }  from './components/null.component';

import { dummyModule } from './modules/dummy/dummy.module';

const appRoutes: Routes = [
	{
		path : 'login',
		component : LoginBox
	},
	{
		path : 'logout',
		component : LogoutComponent,
		canActivate : [AuthGuard]
	},
	{
		path: '',
		component: Home,
		canActivate : [AuthGuard]
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
		dummyModule,
		MaterialModule.forRoot(),
		FlexLayoutModule.forRoot(),
		RouterModule.forRoot(appRoutes)
	],
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
