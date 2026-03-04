import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardPZ } from './card-pz';

describe('CardPZ', () => {
  let component: CardPZ;
  let fixture: ComponentFixture<CardPZ>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardPZ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardPZ);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
