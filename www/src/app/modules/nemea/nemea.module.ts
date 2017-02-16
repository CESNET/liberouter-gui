import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule} from '@angular/router';
import { FormsModule }		from '@angular/forms';
import { nemeaBase, nemeaComponent } from './nemea.component';
import { nemeaStatusComponent } from './status/nemea_status.component'
import { EventsComponent } from './events/events.component'

import { AuthGuard } from  'app/utils/auth.guard';

const nemeaRoutes : Routes = [
	{
		path : 'nemea',
		component : nemeaBase,
		canActivate : [AuthGuard],
		data : {
			basepath : true,
			name : "Nemea",
			icon : "fa-grav",
			img : "path/to/img",
			role : 10
		},
		children : [
			{
				path : '',
				component: nemeaComponent,
				canActivate : [AuthGuard],
				data : {
					role : 10
				}
			},
			{
				path : 'status',
				component: nemeaStatusComponent,
				canActivate : [AuthGuard],
				data : {
					role : 10
				}
			},
			{
				path : 'events',
				component: EventsComponent,
				canActivate : [AuthGuard],
				data : {
					role : 10
				}
			}
		]
	}
];

//export const dummyRouting = RouterModule.forChild(dummyRoutes);

@NgModule({
	imports : [
		CommonModule,
		FormsModule,
		RouterModule.forChild(nemeaRoutes)
	],
	declarations : [nemeaBase, nemeaComponent, nemeaStatusComponent, EventsComponent],
	exports : [],
	providers : []
})
export class nemeaModule {};
