/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { FtasComponent } from './ftas.component';

describe('FtasComponent', () => {
  let component: FtasComponent;
  let fixture: ComponentFixture<FtasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FtasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FtasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
