import { Component, input } from '@angular/core';

@Component({
  selector: 'his-modifica-pz',
  imports: [],
  templateUrl: './modifica-pz.html',
  styleUrl: './modifica-pz.scss',
})
export class ModificaPz {
  patientId = input<string>();
}
