/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ReporterService } from './reporter.service';

describe('ReporterService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ReporterService]
    });
  });

  it('should ...', inject([ReporterService], (service: ReporterService) => {
    expect(service).toBeTruthy();
  }));
});
