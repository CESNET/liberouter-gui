import { NgModule }			from '@angular/core';
import { RouterModule, Router }		from '@angular/router';
import { Routes }			from '@angular/router';
import { BrowserModule }	from '@angular/platform-browser';
import { FormsModule }		from '@angular/forms';
import { MaterialModule }   from "@angular/material";
import { FlexLayoutModule } from "@angular/flex-layout";
import { Http, Request, XHRBackend, RequestOptions} from '@angular/http';


import { AppComponent }  from './app.component';
import { AppRoutingModule } from './app-routing.module';

/** GUARDS **/
import { AuthGuard } from './guards/auth.guard';
import { HttpInterceptor } from './guards/http.interceptor'

/** BASE **/
import { Home }  from './components/home.component';
import { UserToolbar }  from './components/toolbar.component';
import { LogoutComponent }  from './components/logout.component';
import { LoginBox }  from './components/login.component';
import { NullComponent }  from './components/null.component';

/** MODULES **/
import { modules } from './modules';

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
		AuthGuard,
		{
			provide : Http,
			useFactory: (xhrBackend: XHRBackend,
				requestOptions: RequestOptions,
				router: Router) =>
					new HttpInterceptor(xhrBackend, requestOptions, router),
			deps: [XHRBackend, RequestOptions, Router]
		}
	],
	bootstrap : [
		AppComponent
	]
})
export class AppModule { }
