import { NgModule } from '@angular/core';
import { usersRouting } from './users.routes';
import { usersComponent } from './users.component';

@NgModule({
	imports : [usersRouting],
	//	declarations : [dummyComponent]
})
export class usersModule {};
