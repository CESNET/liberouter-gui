import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { dummyComponent } from './dummy.component';

import { AuthGuard } from  '../../guards/auth.guard';


const dummyRoutes : Routes = [
	{
		path : 'dummy',
		component : dummyComponent,
		canActivate : [AuthGuard],
		data : {
			basepath : true,
			name : "Dummy Module Name",
			img : "path/to/img",
			role : 10
		},
	},
	{
		path : 'dummy/protected',
		component : dummyComponent,
		canActivate : [AuthGuard],
		data : {
			role : 10
		}
	}
];

//export const dummyRouting = RouterModule.forChild(dummyRoutes);


@NgModule({
	imports : [
		RouterModule.forChild(dummyRoutes)
	],
	declarations : [dummyComponent],
	exports : [dummyComponent, RouterModule]
})
export class dummyRouting {};
