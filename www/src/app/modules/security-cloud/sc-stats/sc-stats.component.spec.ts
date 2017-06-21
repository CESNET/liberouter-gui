import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScStatsComponent } from './sc-stats.component';

describe('ScStatsComponent', () => {
  let component: ScStatsComponent;
  let fixture: ComponentFixture<ScStatsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScStatsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
