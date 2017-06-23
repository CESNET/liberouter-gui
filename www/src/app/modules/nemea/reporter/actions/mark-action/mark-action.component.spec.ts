import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MarkActionComponent } from './mark-action.component';

describe('MarkActionComponent', () => {
  let component: MarkActionComponent;
  let fixture: ComponentFixture<MarkActionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MarkActionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarkActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
