import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScDbqryIplookupComponent } from './sc-dbqry-iplookup.component';

describe('ScDbqryIplookupComponent', () => {
  let component: ScDbqryIplookupComponent;
  let fixture: ComponentFixture<ScDbqryIplookupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScDbqryIplookupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScDbqryIplookupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
