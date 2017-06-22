import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WardenActionComponent } from './warden-action.component';

describe('WardenActionComponent', () => {
  let component: WardenActionComponent;
  let fixture: ComponentFixture<WardenActionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WardenActionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WardenActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
