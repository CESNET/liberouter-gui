import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { dummyComponent } from './dummy.component';


const dummyRoutes : Routes = [
	{
		path : 'dummy',
		component : dummyComponent
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
export class dummyRouting {
};
