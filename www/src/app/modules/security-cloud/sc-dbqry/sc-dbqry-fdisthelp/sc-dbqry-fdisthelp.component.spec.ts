import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScDbqryFdisthelpComponent } from './sc-dbqry-fdisthelp.component';

describe('ScDbqryFdisthelpComponent', () => {
  let component: ScDbqryFdisthelpComponent;
  let fixture: ComponentFixture<ScDbqryFdisthelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScDbqryFdisthelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScDbqryFdisthelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
