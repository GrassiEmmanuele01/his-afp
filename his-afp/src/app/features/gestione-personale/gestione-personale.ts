import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Fieldset } from 'primeng/fieldset';
import { Select } from 'primeng/select';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { StaffManager } from '../../core/Staff/staff-manager';
import { ROLE_OPTIONS, RoleCode, Staff } from '../../core/Staff/Staff.model';

@Component({
  selector: 'his-gestione-personale',
  imports: [Fieldset, FormsModule, Select, ToggleSwitch],
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

  onRoleChange(staff: Staff, role: RoleCode) {
    if (role !== staff.role) {
      this.staffManager.editRole(staff.id, role);
    }
  }

  onToggleActive(staff: Staff) {
    this.staffManager.setActiveState(staff);
  }
}