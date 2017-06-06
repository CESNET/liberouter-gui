import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule} from '@angular/router';
import { FormsModule }		from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { NgGridModule } from 'angular2-grid';

import { CodemirrorModule } from 'ng2-codemirror';

/**
  * ngx charts
  */
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AuthGuard } from  'app/utils/auth.guard';
import { IdeaPipe } from './events/idea.pipe';

import { nemeaBase, nemeaComponent } from './nemea.component';

/**
  * NEMEA Events
  */
import { EventsComponent } from './events/events.component';
import { EventItemComponent } from './events/event-item/event-item.component';
import { EventDetailComponent } from './events/event-detail/event-detail.component';
import { SafePipe, SafePipeModule } from 'app/utils/safe.pipe';

/**
  * NEMEA Dashboard
  */
import { DashboardComponent } from './dashboard/dashboard.component';
import { DashBoxComponent } from './dashboard/dash-box/dash-box.component';
import { DashBoxModalComponent } from './dashboard/dash-box-modal/dash-box-modal.component';

/**
  * NEMEA Reporter Configuration
  */
import { nemeaReporterConfComponent } from './reporter/reporter_conf.component';

/**
  * NEMEA Status
  */
import { nemeaStatusComponent } from './status/nemea_status.component';

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
				path : 'dashboard',
				component : DashboardComponent,
				canActivate : [AuthGuard],
				data : {
					role : 255
				}
			},
			{
				path : 'reporters',
				component: nemeaReporterConfComponent,
				canActivate : [AuthGuard],
				data : {
					role : 10
				}
			},
            {
				path : 'reporters/:id',
				component: nemeaReporterConfComponent,
				canActivate : [AuthGuard],
				data : {
					role : 10
				}
			}
		]
	}
];

@NgModule({
	imports : [
		CommonModule,
		FormsModule,
		SafePipeModule,
		CodemirrorModule,
		NgGridModule,
		BrowserAnimationsModule,
		NgxChartsModule,
		NgbModule.forRoot(),
		RouterModule.forChild(nemeaRoutes)
	],
	declarations : [
		IdeaPipe,
		nemeaBase,
		nemeaComponent,
		nemeaStatusComponent,
		nemeaReporterConfComponent,
		EventsComponent,
		EventItemComponent,
		EventDetailComponent,
		DashboardComponent,
		DashBoxModalComponent,
		DashBoxComponent],
	exports : [],
	providers : [SafePipe],
	entryComponents : [EventDetailComponent, DashBoxModalComponent]
})
export class nemeaModule {};
