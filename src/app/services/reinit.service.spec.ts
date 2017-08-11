import { TestBed, inject } from '@angular/core/testing';

import { ReinitService } from './reinit.service';

describe('ReinitService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ReinitService]
    });
  });

  it('should be created', inject([ReinitService], (service: ReinitService) => {
    expect(service).toBeTruthy();
  }));
});
