import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FtasModalComponent } from './ftas-modal.component';

describe('FtasModalComponent', () => {
  let component: FtasModalComponent;
  let fixture: ComponentFixture<FtasModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FtasModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FtasModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
