import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule, Http, Request, XHRBackend, RequestOptions} from '@angular/http';
import { RouterModule, Routes, Router } from '@angular/router';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppComponent } from './app.component';
import { HomeComponent } from './components/';
import { LoginComponent } from './components/';
import { LogoutComponent } from './components/';
import { SetupComponent } from './components/';
import { NullComponent } from './components/';

import { AuthGuard, HttpInterceptor } from './utils';
import { SafePipe, SafePipeModule } from 'app/utils/safe.pipe';

import { modules } from './modules';

/**
  * Basic routes of the application
  */
const appRoutes: Routes = [
	{
		path : 'login',
		component : LoginComponent
	},
	{
		path : 'logout',
		component : LogoutComponent,
		canActivate : [AuthGuard]
	},
	{
		path : 'setup',
		component : SetupComponent
	},
	{
		path: '',
		component: HomeComponent,
		canActivate : [AuthGuard]
	},
	{
		path: '**',
		component: NullComponent
	}
];

/**
  * Initialization function for the whole application
  *
  * Used because we need the config before HttpInterceptor is created
  * Inspired by: https://stackoverflow.com/questions/40909822/how-to-use-httpinterceptor-and-configservice-both-at-the-same-time-in-angular2
  */
export function initApp(config : any) {
	@NgModule({
	  declarations: [
		AppComponent,
		HomeComponent,
		LoginComponent,
		LogoutComponent,
		SetupComponent,
		NullComponent
	  ],
	  imports: [
		modules,
		SafePipeModule,
		BrowserModule,
		FormsModule,
		HttpModule,
		NgbModule.forRoot(),
		RouterModule.forRoot(appRoutes)
	  ],
	  providers: [
		AuthGuard,
		SafePipe,
		{
			provide : config,
			useValue : config
		},
		{
			provide : Http,
			useFactory: (xhrBackend: XHRBackend, requestOptions: RequestOptions,
				router: Router, config : string) => {
					return new HttpInterceptor(xhrBackend, requestOptions, router, config);
				},
			deps: [XHRBackend, RequestOptions, Router, config]
		}
	  ],
	  bootstrap: [AppComponent]
	})
	class AppModule { }

	return AppModule;
}
