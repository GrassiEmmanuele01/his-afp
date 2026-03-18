import { ChangeDetectionStrategy, Component, effect, input } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { PazienteDTO } from '../../core/Pazienti/Pazienti.model';
import { APIResponse } from '../../core/models/APIResponse.model';
import { JsonPipe } from '@angular/common';
import { Button } from 'primeng/button';

@Component({
  selector: 'his-modifica-pz',
  imports: [JsonPipe, Button],
  templateUrl: './modifica-pz.html',
  styleUrl: './modifica-pz.scss',
})
export class ModificaPz {
  patientId = input<string>();

  patient = httpResource<APIResponse<PazienteDTO>>(
    () => `http://localhost:3000/admissions/${this.patientId()}`,
  );

  constructor() {
    effect(() => {
      if (this.patientId() === undefined) {
        console.warn(
          'Patient ID is undefined. Please provide a valid patient ID in the route parameters.',
        );
      }
    });
  }
}
