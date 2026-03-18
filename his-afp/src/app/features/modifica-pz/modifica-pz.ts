import { httpResource } from '@angular/common/http';
import { Component, effect, input } from '@angular/core';
import { PazienteDTO } from '../../core/Pazienti/Pazienti.model';

@Component({
  selector: 'his-modifica-pz',
  imports: [],
  templateUrl: './modifica-pz.html',
  styleUrl: './modifica-pz.scss',
})
export class ModificaPz {
  patientId = input<string>();
  patient=httpResource<PazienteDTO>(()=>`http://localhost:3000/admission/${this.patientId()}`)
  constructor() { 
    effect(() => { 
      if (this.patientId() === undefined){
        console.warn('PatientID is undefined');
      }
    })
  }
}
