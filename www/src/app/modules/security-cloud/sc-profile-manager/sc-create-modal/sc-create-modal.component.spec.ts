import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScCreateModalComponent } from './sc-create-modal.component';

describe('ScCreateModalComponent', () => {
  let component: ScCreateModalComponent;
  let fixture: ComponentFixture<ScCreateModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScCreateModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScCreateModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
