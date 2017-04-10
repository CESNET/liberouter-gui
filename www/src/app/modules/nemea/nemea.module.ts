import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule} from '@angular/router';
import { FormsModule }		from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { nemeaBase, nemeaComponent } from './nemea.component';
import { nemeaStatusComponent } from './status/nemea_status.component';
import { EventsComponent } from './events/events.component';
import { nemeaExportersConfigurationComponent } from './configuration/exporters_configuration.component';

import { AuthGuard } from  'app/utils/auth.guard';
import { IdeaPipe } from './events/idea.pipe';
import { EventItemComponent } from './events/event-item/event-item.component';
import { EventDetailComponent } from './events/event-detail/event-detail.component';

const nemeaRoutes : Routes = [
	{
		path : 'nemea',
		component : nemeaBase,
		canActivate : [AuthGuard],
		data : {
			basepath : true,
			name : "NEMEA",
			description : "System for network traffic analysis and anomaly detection.",
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
			},
			{
				path : 'exporters',
				component: nemeaExportersConfigurationComponent,
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
		NgbModule.forRoot(),
		RouterModule.forChild(nemeaRoutes)
	],
	declarations : [
		IdeaPipe,
		nemeaBase,
		nemeaComponent,
		nemeaStatusComponent,
		EventsComponent,
		EventItemComponent,
		EventDetailComponent],
	exports : [],
	providers : [],
	entryComponents : [EventDetailComponent]
})
export class nemeaModule {};
