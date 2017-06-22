import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule} from '@angular/router';
import { FormsModule } from '@angular/forms';

import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

import { AuthGuard } from  'app/utils/auth.guard';
import { SafePipe, SafePipeModule } from 'app/utils/safe.pipe';

import { SecurityCloudComponent } from './sc.component';
import { ScGraphComponent } from './sc-graph/sc-graph.component';
import { ScStatsComponent } from './sc-stats/sc-stats.component';
import { ScDbqryComponent } from './sc-dbqry/sc-dbqry.component';
import { ScDbqryFdisthelpComponent } from './sc-dbqry/sc-dbqry-fdisthelp/sc-dbqry-fdisthelp.component';
import { OutputVolumeConversionPipe } from './modules/OutputVolumeConversionPipe';
import { ScGraphRenderComponent } from './sc-graph/sc-graph-render/sc-graph-render.component';

import { NgDygraphsModule } from 'ng-dygraphs';

const routes : Routes = [{
	path : 'security-cloud',
	component : SecurityCloudComponent,
	canActivate : [AuthGuard],
	data : {
		role : 10,
		name : "Security Cloud",
		description : "Distributed, highly available IP flow record collector.",
		icon : "fa-cloud"
	}
}]

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		SafePipeModule,
		RouterModule.forChild(routes),
		NgbModule,
		NgDygraphsModule,
	],
	declarations: [
		SecurityCloudComponent,
		ScGraphComponent,
		ScStatsComponent,
		ScDbqryComponent,
		ScDbqryFdisthelpComponent,
		OutputVolumeConversionPipe,
		ScGraphRenderComponent
	],
	providers : [
		SafePipe
	]
})
export class SecurityCloudModule { }
