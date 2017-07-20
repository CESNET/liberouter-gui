import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScViewModalComponent } from './sc-view-modal.component';

describe('ScViewModalComponent', () => {
  let component: ScViewModalComponent;
  let fixture: ComponentFixture<ScViewModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScViewModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScViewModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
