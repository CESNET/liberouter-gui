import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MongoActionComponent } from './mongo-action.component';

describe('MongoActionComponent', () => {
  let component: MongoActionComponent;
  let fixture: ComponentFixture<MongoActionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MongoActionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MongoActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
