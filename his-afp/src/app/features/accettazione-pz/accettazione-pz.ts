import { Component, inject } from '@angular/core';
import { GestioneRisorse } from '../../core/Risorse/gestione-risorse';
import { JsonPipe } from '@angular/common';

@Component({
  selector: 'his-accettazione-pz',
  imports: [JsonPipe],
  templateUrl: './accettazione-pz.html',
  styleUrl: './accettazione-pz.scss',
})
export class AccettazionePz {
  gestioneRisorse = inject(GestioneRisorse);

}
