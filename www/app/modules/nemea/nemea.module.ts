import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule} from '@angular/router';
import { MaterialModule }   from "@angular/material";
import { FormsModule }		from '@angular/forms';
import { nemeaBase, nemeaComponent } from './nemea.component';
import { nemeaStatusComponent, GetKeyPipe } from './status/nemea_status.component'

import { AuthGuard } from  '../../guards/auth.guard';

const nemeaRoutes : Routes = [
	{
		path : 'nemea',
		component : nemeaBase,
		canActivate : [AuthGuard],
		data : {
			basepath : true,
			name : "Nemea",
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
			}
		]
	}
];

//export const dummyRouting = RouterModule.forChild(dummyRoutes);

@NgModule({
	imports : [
		CommonModule,
		MaterialModule.forRoot(),
		FormsModule,
		RouterModule.forChild(nemeaRoutes)
	],
	declarations : [nemeaBase, nemeaComponent, nemeaStatusComponent, GetKeyPipe],
	exports : [],
	providers : []
})
export class nemeaModule {};

