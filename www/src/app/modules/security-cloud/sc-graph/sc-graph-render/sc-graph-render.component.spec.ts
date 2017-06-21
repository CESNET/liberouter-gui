import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScGraphRenderComponent } from './sc-graph-render.component';

describe('ScGraphRenderComponent', () => {
  let component: ScGraphRenderComponent;
  let fixture: ComponentFixture<ScGraphRenderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScGraphRenderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScGraphRenderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
