import { TestBed } from '@angular/core/testing';

import { GestioneRisorse } from './gestione-risorse';

describe('GestioneRisorse', () => {
  let service: GestioneRisorse;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GestioneRisorse);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
