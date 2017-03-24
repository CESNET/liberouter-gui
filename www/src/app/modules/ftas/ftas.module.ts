import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule} from '@angular/router';

import { AuthGuard } from  'app/utils/auth.guard';

import { FtasComponent } from './ftas.component'
import { SafePipe } from 'app/utils/safe.pipe';

const ftasRoutes : Routes = [{
    path : 'ftas',
    component : FtasComponent,
    canActivate : [AuthGuard],
    data : {
        role : 10,
        name : "FTAS",
        description : "The mighty FTAS!",
        icon : "fa-first-order"
    }
}]

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(ftasRoutes)
  ],
  declarations: [
    FtasComponent,
    SafePipe
  ]
})
export class FtasModule { }
