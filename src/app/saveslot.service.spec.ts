import { TestBed } from '@angular/core/testing';

import { SaveslotService } from './saveslot.service';

describe('SaveslotService', () => {
  let service: SaveslotService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SaveslotService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
