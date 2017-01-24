import { NgModule } from '@angular/core';
import { dummyRouting } from './dummy.routes';
import { dummyComponent } from './dummy.component';

@NgModule({
	imports : [dummyRouting],
	//	declarations : [dummyComponent]
})
export class dummyModule {
	getName() {
		return "I am Dummy!";
	}
};
