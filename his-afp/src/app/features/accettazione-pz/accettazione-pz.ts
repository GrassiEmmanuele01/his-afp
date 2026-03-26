import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { GestioneRisorse } from '../../core/Risorse/gestione-risorse';
import { InputText } from "primeng/inputtext";
import { FormBuilder,ReactiveFormsModule, Validators } from '@angular/forms';
import { JsonPipe } from '@angular/common';
import { Button } from "primeng/button";
import { MessageModule } from 'primeng/message';
import { DatePickerModule } from 'primeng/datepicker';
import { InputMaskModule } from 'primeng/inputmask';
import { SelectModule } from 'primeng/select';
import { TextareaModule } from 'primeng/textarea';
import { FieldsetModule } from 'primeng/fieldset';

@Component({
  selector: 'his-accettazione-pz',
  imports: [JsonPipe, InputText, ReactiveFormsModule, Button, MessageModule, DatePickerModule, InputMaskModule, SelectModule, TextareaModule,FieldsetModule],
  templateUrl: './accettazione-pz.html',
  styleUrl: './accettazione-pz.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
        <div class="card flex justify-center">
            <p-datepicker [(ngModel)]="date" dateFormat="dd/mm/yy" placeholder="dd/mm/yyyy" pInputMask="99/99/9999" />
        </div>
    `,
    standalone: true,
})
export class AccettazionePz {
  gestioneRisorse = inject(GestioneRisorse);

  // });
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

  checkFormControl(control: string) { 
    const fc = this.paziente.get(control);
    return fc?.invalid && (fc.touched || fc.dirty);
  }
  checkFormControlError(control: string, err: string) {
    const fc = this.paziente.get(control);

    if (fc && fc.hasError(err)) { 
      return fc?.getError(err);
    } else {
      return null;
    }
  }

  onSubmit() {
    if (this.paziente.valid) {
      console.log(this.paziente.value)
    } else { 
      this.paziente.markAllAsTouched;
    }
  }
}