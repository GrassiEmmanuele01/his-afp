import { ChangeDetectionStrategy, Component, effect, inject, input } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { PazienteDTO } from '../../core/Pazienti/Pazienti.model';
import { APIResponse } from '../../core/models/APIResponse.model';
import { formatDate, JsonPipe } from '@angular/common';
import { Button } from 'primeng/button';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { GestioneRisorse } from '../../core/Risorse/gestione-risorse';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { FieldsetModule } from 'primeng/fieldset';
import { MessageModule } from 'primeng/message';
import { DatePickerModule } from 'primeng/datepicker';
import { InputMaskModule } from 'primeng/inputmask';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'his-modifica-pz',
  imports: [JsonPipe, Button, InputTextModule, ReactiveFormsModule, MessageModule, DatePickerModule, InputMaskModule, SelectModule, TextareaModule,FieldsetModule],
  templateUrl: './modifica-pz.html',
  styleUrl: './modifica-pz.scss',
})
export class ModificaPz {
  gestioneRisorse = inject(GestioneRisorse);
  patientId = input<string>();
  patientReq= httpResource<APIResponse<PazienteDTO>>(
    () => `http://localhost:3000/admissions/${this.patientId()}`,
  );
  readonly maxDate = new Date();
  readonly sexOption = [
    {
      code: 'M',
      desc:'Maschio',
    },
    {
      code: 'F',
      desc:'Femmina'
    }
  ]
  readonly #fb = inject(FormBuilder);
  paziente = this.#fb.group({
    anagrafica: this.#fb.group({
      nome: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(30),
            ]],
      cognome: ['', [Validators.required]],
      dataNascita: ['', [Validators.required]],
      codiceFiscale: ['', [
        Validators.required,
        Validators.pattern(`[A-Z]{6}\\d{2}[A-Z]\\d{2}[A-Z]\\d{3}[A-Z]`)
      ]],  
      sesso: ['', [Validators.required]],
    }),
    sanitaria: this.#fb.group({
      patologia: ['', [Validators.required]],
      codiceColore: ['', [Validators.required]],
      modArrivo: ['', [Validators.required]],
      noteTriage: ['', [Validators.required, Validators.maxLength(500)]],
    })
  })

  constructor() {
    effect(() => { 
      const pzVal = this.patientReq.value();
      if (this.patientId() === undefined) { 
        console.log('No patient id provided')
      }
      if (pzVal?.data) { 
        const data = pzVal.data;
        this.paziente.patchValue({
          anagrafica: {
            nome: data.nome,
            cognome: data.cognome,
            dataNascita: formatDate(data.dataNascita,'dd/MM/yyyy','en'),
            codiceFiscale: data.codiceFiscale,
            sesso:data.sex,
          },
          sanitaria: {
            patologia: data.patologiaCode,
            modArrivo: data.modalitaArrivoCode,
            noteTriage: data.noteTriage,
            codiceColore:data.coloreCode,
          }
        });
      }
    })

      if (this.patientId() === undefined) {
        console.warn(
          'Patient ID is undefined. Please provide a valid patient ID in the route parameters.',
        );
      }
    }

  checkFormControl(control: string) { 
    const fc = this.paziente.get(control);
    return fc?.invalid && (fc.touched || fc.dirty);
  }
  checkFormControlError(control: string, err: string) {
    const fc = this.paziente.get(control);    if (fc && fc.hasError(err)) { 
      return fc.getError(err);
    }
  } onSubmit() {
    if (this.paziente.valid) {
      console.log(this.paziente.value)
    //  this.patientManager.admitPatient(this.paziente.value as PatientAdmission);
    } else { 
      this.paziente.markAllAsTouched();
    }
  }
}
