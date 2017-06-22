import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TrapActionComponent } from './trap-action.component';

describe('TrapActionComponent', () => {
  let component: TrapActionComponent;
  let fixture: ComponentFixture<TrapActionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TrapActionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrapActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
