/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { NullComponent } from './null.component';

describe('NullComponent', () => {
  let component: NullComponent;
  let fixture: ComponentFixture<NullComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NullComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NullComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
