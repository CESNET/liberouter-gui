import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule} from '@angular/router';

import { AuthGuard } from 'app/utils/auth.guard';
import { SafePipe, SafePipeModule } from 'app/utils/safe.pipe';

import { SecurityCloudComponent } from './sc.component'

const routes: Routes = [{
    path : 'security-cloud',
    component : SecurityCloudComponent,
    canActivate : [AuthGuard],
    data : {
        role : 10,
        name : 'Security Cloud',
        description : 'Distributed, highly available IP flow record collector.',
        icon : 'fa-cloud'
    }
}]

@NgModule({
  imports: [
    CommonModule,
    SafePipeModule,
    RouterModule.forChild(routes)
  ],
  declarations: [
    SecurityCloudComponent
  ],
  providers : [
    SafePipe
  ]
})
export class SecurityCloudModule { }
