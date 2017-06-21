import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScGraphComponent } from './sc-graph.component';

describe('ScGraphComponent', () => {
  let component: ScGraphComponent;
  let fixture: ComponentFixture<ScGraphComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScGraphComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
