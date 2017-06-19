import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NerdModalComponent } from './nerd-modal.component';

describe('NerdModalComponent', () => {
  let component: NerdModalComponent;
  let fixture: ComponentFixture<NerdModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NerdModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NerdModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
