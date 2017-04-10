import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule} from '@angular/router';

import { AuthGuard } from  'app/utils/auth.guard';
import { SafePipe, SafePipeModule } from 'app/utils/safe.pipe';

import { NerdComponent } from './nerd.component'

const routes : Routes = [{
    path : 'nerd',
    component : NerdComponent,
    canActivate : [AuthGuard],
    data : {
        role : 10,
        name : "NERD",
        description : "There is nothing nerdy about NERD.",
        icon : "fa-user-secret"
    }
}]

@NgModule({
  imports: [
    CommonModule,
    SafePipeModule,
    RouterModule.forChild(routes)
  ],
  declarations: [
    NerdComponent
  ],
  providers : [
    SafePipe
  ]
})
export class NerdModule { }
