import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule} from '@angular/router';
import { FormsModule } from '@angular/forms';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { UsersComponent } from './users.component';
import { UsersAddComponent } from './users-add/users-add.component';
import { UsersListComponent } from './users-list/users-list.component';
import { UsersEditComponent } from './users-edit/users-edit.component';

import { AuthGuard } from 'app/utils/auth.guard';

const usersRoutes: Routes = [
    {
        path : 'users',
        component : UsersComponent,
        canActivate : [AuthGuard],
        data : {
            basepath : true,
            name : 'Users',
            description : 'Manage users, update profiles and passwords.',
            icon : 'fa-user-circle',
            role : 0
        },
        children : [
            {
                path : '',
                component: UsersListComponent,
                canActivate : [AuthGuard],
                data : {
                    role : 0
                }
            },
            {
                path : 'add',
                component : UsersAddComponent,
                canActivate : [AuthGuard],
                data : {
                    role : 0,
                    name : 'Add User'
                }
            },
            {
                path : ':id',
                component : UsersEditComponent,
                canActivate : [AuthGuard],
                data : {
                    role : 0,
                    name : 'Edit User'
                }
            }
        ]
    }
];

@NgModule({
    imports : [
        CommonModule,
        FormsModule,
        NgbModule.forRoot(),
        RouterModule.forChild(usersRoutes)
    ],
    declarations : [
        UsersComponent,
        UsersListComponent,
        UsersAddComponent,
        UsersEditComponent
    ],
    exports : [
        UsersComponent,
        RouterModule
    ]
})
export class UsersModule {};
