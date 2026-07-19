import { ChangeDetectionStrategy, Component, inject, output, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { formatDate } from '@angular/common';
import { Button } from 'primeng/button';
import { DatePicker } from 'primeng/datepicker';
import { Fieldset } from 'primeng/fieldset';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { SelectButton } from 'primeng/selectbutton';
import { PatientManager } from '../../core/Pazienti/patient-manager';
import { PatientSearchResult } from '../../core/Pazienti/Pazienti.model';

type ModalitaRicerca = 'cf' | 'anagrafica';

@Component({
  selector: 'his-ricerca-pz',
  imports: [
    Button,
    DatePicker,
    Fieldset,
    FormsModule,
    InputText,
    Message,
    ReactiveFormsModule,
    SelectButton,
  ],
  templateUrl: './ricerca-pz.html',
  styleUrl: './ricerca-pz.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RicercaPz {
  readonly #fb = inject(FormBuilder);
  readonly #patientManager = inject(PatientManager);

  readonly maxDate = new Date();

  readonly modalitaOptions: { label: string; value: ModalitaRicerca }[] = [
    { label: 'Codice Fiscale', value: 'cf' },
    { label: 'Nome, Cognome e Data di Nascita', value: 'anagrafica' },
  ];
  modalita = signal<ModalitaRicerca>('cf');

  risultati = signal<PatientSearchResult[]>([]);
  ricercaEffettuata = signal(false);
  ricercaInCorso = signal(false);

  pazienteSelezionato = output<PatientSearchResult>();
  nuovoPaziente = output<void>();

  cfForm = this.#fb.group({
    codiceFiscale: [
      '',
      [Validators.required, Validators.pattern('[A-Za-z]{6}\\d{2}[A-Za-z]\\d{2}[A-Za-z]\\d{3}[A-Za-z]')],
    ],
  });

  anagraficaForm = this.#fb.group({
    nome: ['', [Validators.required]],
    cognome: ['', [Validators.required]],
    dataNascita: ['', [Validators.required]],
  });

  checkFormControl(control: AbstractControl | null) {
    return control?.invalid && (control.touched || control.dirty);
  }

  checkFormControlError(control: AbstractControl | null, err: string): unknown {
    return control && control.hasError(err) ? control.getError(err) : null;
  }

  cambiaModalita(nuovaModalita: ModalitaRicerca) {
    this.modalita.set(nuovaModalita);
    this.risultati.set([]);
    this.ricercaEffettuata.set(false);
  }

  cerca() {
    if (this.modalita() === 'cf') {
      if (this.cfForm.invalid) {
        this.cfForm.markAllAsTouched();
        return;
      }
      const cf = this.cfForm.value.codiceFiscale!.toUpperCase();
      this.eseguiRicerca({ cf });
    } else {
      if (this.anagraficaForm.invalid) {
        this.anagraficaForm.markAllAsTouched();
        return;
      }
      const { nome, cognome, dataNascita } = this.anagraficaForm.value;
      this.eseguiRicerca({
        nome: nome!,
        cognome: cognome!,
        data_nascita: formatDate(dataNascita!, 'yyyy-MM-dd', 'en'),
      });
    }
  }

  private eseguiRicerca(criteria: { cf: string } | { nome: string; cognome: string; data_nascita: string }) {
    this.ricercaInCorso.set(true);
    this.#patientManager.searchPatients(criteria).subscribe({
      next: (risultati) => {
        this.risultati.set(risultati);
        this.ricercaEffettuata.set(true);
        this.ricercaInCorso.set(false);
      },
      error: (err) => {
        console.error('Errore durante la ricerca pazienti:', err);
        this.risultati.set([]);
        this.ricercaEffettuata.set(true);
        this.ricercaInCorso.set(false);
      },
    });
  }

  selezionaPaziente(paziente: PatientSearchResult) {
    this.pazienteSelezionato.emit(paziente);
  }

  onNuovoPaziente() {
    this.nuovoPaziente.emit();
  }
}