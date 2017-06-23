import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FileActionComponent } from './file-action.component';

describe('FileActionComponent', () => {
  let component: FileActionComponent;
  let fixture: ComponentFixture<FileActionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FileActionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FileActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
