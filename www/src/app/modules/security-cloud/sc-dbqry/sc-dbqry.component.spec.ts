import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScDbqryComponent } from './sc-dbqry.component';

describe('ScDbqryComponent', () => {
  let component: ScDbqryComponent;
  let fixture: ComponentFixture<ScDbqryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScDbqryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScDbqryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
