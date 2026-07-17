import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { Fieldset } from 'primeng/fieldset';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { FormsModule } from '@angular/forms';
import { StaffManager } from '../../core/Staff/staff-manager';
import { ROLE_OPTIONS } from '../../core/Staff/Staff.model';

@Component({
  selector: 'his-gestione-personale',
  imports: [Fieldset, FormsModule, ToggleSwitch],
  templateUrl: './gestione-personale.html',
  styleUrl: './gestione-personale.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GestionePersonale implements OnInit {
  readonly staffManager = inject(StaffManager);
  readonly roleOptions = ROLE_OPTIONS;

  ngOnInit() {
    this.staffManager.fetchStaff();
  }
}