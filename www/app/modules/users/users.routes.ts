import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule} from '@angular/router';
import { MaterialModule }   from "@angular/material";
import { FormsModule }		from '@angular/forms';
import { HttpService } from '../../services/http.service';
import {
	usersComponent,
	usersAddComponent,
	usersListComponent
	} from './users.component';

import { AuthGuard } from  '../../guards/auth.guard';

const usersRoutes : Routes = [
	{
		path : 'users',
		component : usersComponent,
		canActivate : [AuthGuard],
		data : {
			basepath : true,
			name : "Users",
			img : "path/to/img",
			role : 0
		},
		children : [
			{
				path : '',
				component: usersListComponent,
				canActivate : [AuthGuard],
				data : {
					role : 0
				}
			},
			{
				path : 'add',
				component : usersAddComponent,
				canActivate : [AuthGuard],
				data : {
					role : 0,
					name : 'Add User'
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
		RouterModule.forChild(usersRoutes)
	],
	declarations : [usersComponent, usersAddComponent, usersListComponent],
	exports : [usersComponent, usersAddComponent, RouterModule],
	providers : [HttpService]
})
export class usersRouting {};
