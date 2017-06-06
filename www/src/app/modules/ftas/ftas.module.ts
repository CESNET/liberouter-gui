import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule} from '@angular/router';

import { AuthGuard } from  'app/utils/auth.guard';
import { SafePipe, SafePipeModule } from 'app/utils/safe.pipe';

import { FtasComponent } from './ftas.component'

const ftasRoutes : Routes = [{
    path : 'ftas',
    component : FtasComponent,
    canActivate : [AuthGuard],
    data : {
        role : 10,
        name : "FTAS",
        description : "Flow-based Traffic Analysis System",
        icon : "fa-first-order"
    }
}]

@NgModule({
  imports: [
    CommonModule,
    SafePipeModule,
    RouterModule.forChild(ftasRoutes)
  ],
  declarations: [
    FtasComponent
  ],
  providers : [
    SafePipe
  ]
})
export class FtasModule { }
