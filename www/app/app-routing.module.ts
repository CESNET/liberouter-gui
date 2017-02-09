import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from './guards/auth.guard';
import { LoginBox }  from './components/login.component';
import { LogoutComponent }  from './components/logout.component';
import { UserToolbar }  from './components/toolbar.component';
import { Home }  from './components/home.component';
import { NullComponent }  from './components/null.component';

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
		path: '**',
		component: NullComponent
	}
];

@NgModule({
  imports: [
    RouterModule.forRoot(
      appRoutes
	  //{ preloadingStrategy: PreloadSelectedModules }
    )
  ],
  exports: [
    RouterModule
  ],
  providers: [
  //CanDeactivateGuard,
  // PreloadSelectedModules
  ]
})
export class AppRoutingModule {}

