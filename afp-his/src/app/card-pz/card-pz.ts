import { Component, input } from '@angular/core';
import { CardModule } from 'primeng/card';
import { Button } from "primeng/button";

export interface Paziente {
  id: string;
  nome: string;
  cognome: string;
  braccialetto: string;
  eta: number;
  codiceColore: string;
  note: string;
  patologia: string;
}

@Component({
  selector: 'his-card-pz',
  imports: [CardModule, Button],
  templateUrl: './card-pz.html',
  styleUrl: './card-pz.scss',
})
export class CardPZ {
  paziente = input.required<Paziente>();
  borderTop = input.required<boolean>();

  setBorderTop() {
    return this.borderTop() ? 'border-t-8' : 'border-b-8';
  }
  
  setColoreDiStato() {
    switch (this.paziente().codiceColore) {
      case 'NERO':
        return 'border-black';
      case 'ROSSO':
        return 'border-red-500';
      case 'GIALLO':
        return 'border-yellow-500';
      case 'AZZURRO':
        return 'border-blue-500';
      case 'VERDE':
        return 'border-green-500';
      case 'BIANCO':
        return 'border-white';
      default:
        return '';
    }
  }
}
