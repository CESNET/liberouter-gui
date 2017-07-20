import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScProfileManagerComponent } from './sc-profile-manager.component';

describe('ScProfileManagerComponent', () => {
  let component: ScProfileManagerComponent;
  let fixture: ComponentFixture<ScProfileManagerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScProfileManagerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScProfileManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
