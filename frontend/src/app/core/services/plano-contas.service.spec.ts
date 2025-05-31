import { TestBed } from '@angular/core/testing';

import { PlanoContasService } from './plano-contas.service';

describe('PlanoContasService', () => {
  let service: PlanoContasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlanoContasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
