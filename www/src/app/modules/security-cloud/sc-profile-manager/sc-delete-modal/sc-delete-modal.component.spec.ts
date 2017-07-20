import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScDeleteModalComponent } from './sc-delete-modal.component';

describe('ScDeleteModalComponent', () => {
  let component: ScDeleteModalComponent;
  let fixture: ComponentFixture<ScDeleteModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScDeleteModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScDeleteModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
