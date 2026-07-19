import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormAccettazionePz } from '../form-accettazione-pz/form-accettazione-pz';
import { RicercaPz } from '../ricerca-pz/ricerca-pz';
import { PatientSearchResult } from '../../core/Pazienti/Pazienti.model';

@Component({
  selector: 'his-accettazione-pz',
  imports: [FormAccettazionePz, RicercaPz],
  templateUrl: './accettazione-pz.html',
  styleUrl: './accettazione-pz.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccettazionePz {
  pazienteSelezionato = signal<PatientSearchResult | null>(null);
  mostraForm = signal(false);

  onPazienteTrovato(paziente: PatientSearchResult) {
    this.pazienteSelezionato.set(paziente);
    this.mostraForm.set(true);
  }

  onNuovoPaziente() {
    this.pazienteSelezionato.set(null);
    this.mostraForm.set(true);
  }
}