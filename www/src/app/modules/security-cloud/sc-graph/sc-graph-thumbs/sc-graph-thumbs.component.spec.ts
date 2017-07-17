import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScGraphThumbsComponent } from './sc-graph-thumbs.component';

describe('ScGraphThumbsComponent', () => {
  let component: ScGraphThumbsComponent;
  let fixture: ComponentFixture<ScGraphThumbsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScGraphThumbsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScGraphThumbsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
