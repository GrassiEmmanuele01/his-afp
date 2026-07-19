import { ChangeDetectionStrategy, Component, effect, inject, input, untracked } from '@angular/core';
import { GestioneRisorse } from '../../core/Risorse/gestione-risorse';
import { InputText } from 'primeng/inputtext';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from 'primeng/button';
import { Message } from 'primeng/message';
import { DatePicker } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { Textarea } from 'primeng/textarea';
import { Fieldset } from 'primeng/fieldset';
import { PatientManager } from '../../core/Pazienti/patient-manager';
import { PatientAdmission, PatientSearchResult } from '../../core/Pazienti/Pazienti.model';

interface LengthValidationError {
  requiredLength: number;
  actualLength: number;
}

@Component({
  selector: 'his-form-accettazione-pz',
  imports: [
    InputText,
    ReactiveFormsModule,
    Button,
    Message,
    DatePicker,
    SelectModule,
    Textarea,
    Fieldset,
  ],
  templateUrl: './form-accettazione-pz.html',
  styleUrl: './form-accettazione-pz.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormAccettazionePz {
  gestioneRisorse = inject(GestioneRisorse);
  patientManager = inject(PatientManager);

  pazienteSelezionato = input<PatientSearchResult | null>(null);

  readonly maxDate = new Date();
  readonly sexOption = [
    { code: 'M', desc: 'Maschio' },
    { code: 'F', desc: 'Femmina' },
  ];

  readonly #fb = inject(FormBuilder);
  paziente = this.#fb.group({
    anagrafica: this.#fb.group({
      nome: ['', [Validators.required]],
      cognome: ['', [Validators.required]],
      dataNascita: ['', [Validators.required]],
      codiceFiscale: [
        '',
        [Validators.required, Validators.pattern('[A-Z]{6}\\d{2}[A-Z]\\d{2}[A-Z]\\d{3}[A-Z]')],
      ],
      sesso: ['', [Validators.required]],
    }),
    sanitaria: this.#fb.group({
      patologia: ['', [Validators.required]],
      codiceColore: ['', [Validators.required]],
      modArrivo: ['', [Validators.required]],
      noteTriage: ['', [Validators.required, Validators.maxLength(500)]],
    }),
  });

  constructor() {
    effect(() => {
      const pz = this.pazienteSelezionato();
      if (pz) {
        untracked(() => {
          this.paziente.get('anagrafica')?.patchValue({
            nome: pz.nome,
            cognome: pz.cognome,
            dataNascita: pz.data_nascita,
            codiceFiscale: pz.codice_fiscale,
            sesso: pz.sex,
          });
        });
      }
    });
  }

  checkFormControl(control: string) {
    const fc = this.paziente.get(control);
    return fc?.invalid && (fc.touched || fc.dirty);
  }

  checkFormControlError(control: string, err: string): unknown {
    const fc = this.paziente.get(control);
    if (fc && fc.hasError(err)) {
      return fc.getError(err);
    } else {
      return null;
    }
  }

  getRequiredLength(control: string, err: string): number | null {
    const fc = this.paziente.get(control);
    if (fc && fc.hasError(err)) {
      const error = fc.getError(err) as LengthValidationError;
      return error.requiredLength;
    }
    return null;
  }

  onSubmit() {
    if (this.paziente.valid) {
      console.log(this.paziente.value);
      this.patientManager.admitPatient(this.paziente.value as PatientAdmission);
    } else {
      this.paziente.markAllAsTouched();
    }
  }
}