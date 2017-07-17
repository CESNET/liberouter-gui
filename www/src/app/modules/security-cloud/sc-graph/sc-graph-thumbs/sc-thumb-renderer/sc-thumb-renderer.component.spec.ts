import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScThumbRendererComponent } from './sc-thumb-renderer.component';

describe('ScThumbRendererComponent', () => {
  let component: ScThumbRendererComponent;
  let fixture: ComponentFixture<ScThumbRendererComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScThumbRendererComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScThumbRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
