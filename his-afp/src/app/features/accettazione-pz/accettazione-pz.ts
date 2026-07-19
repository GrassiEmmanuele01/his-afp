import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormAccettazionePz } from '../accettazione-pz/form-accettazione-pz';

@Component({
  selector: 'his-accettazione-pz',
  imports: [FormAccettazionePz],
  templateUrl: './accettazione-pz.html',
  styleUrl: './accettazione-pz.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccettazionePz {}