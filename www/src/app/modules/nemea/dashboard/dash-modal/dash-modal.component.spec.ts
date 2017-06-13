import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DashModalComponent } from './dash-modal.component';

describe('DashModalComponent', () => {
  let component: DashModalComponent;
  let fixture: ComponentFixture<DashModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DashModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
