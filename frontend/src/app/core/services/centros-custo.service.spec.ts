import { TestBed } from '@angular/core/testing';

import { CentrosCustoService } from './centros-custo.service';

describe('CentrosCustoService', () => {
  let service: CentrosCustoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CentrosCustoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
