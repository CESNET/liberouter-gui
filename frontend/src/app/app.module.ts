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

export function httpFactory(xhrBackend: XHRBackend, requestOptions: RequestOptions, router: Router) : HttpInterceptor {
    return new HttpInterceptor(xhrBackend, requestOptions, router);
}

/**
  * Initialization class for the whole application
  */
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
        provide : Http,
        useFactory: (httpFactory),
        deps: [XHRBackend, RequestOptions, Router]
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
