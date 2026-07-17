import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from 'primeng/button';
import { Fieldset } from 'primeng/fieldset';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { Password } from 'primeng/password';
import { Select } from 'primeng/select';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { StaffManager } from '../../core/Staff/staff-manager';
import { ROLE_OPTIONS, RoleCode, Staff } from '../../core/Staff/Staff.model';
import { usernameDisponibileValidator } from '../../core/Staff/username-disponibile.validator';

@Component({
  selector: 'his-gestione-personale',
  imports: [
    Button,
    Fieldset,
    FormsModule,
    InputText,
    Message,
    Password,
    ReactiveFormsModule,
    Select,
    ToggleSwitch,
  ],
  templateUrl: './gestione-personale.html',
  styleUrl: './gestione-personale.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GestionePersonale implements OnInit {
  readonly staffManager = inject(StaffManager);
  readonly roleOptions = ROLE_OPTIONS;

  readonly #fb = inject(FormBuilder);
  nuovoOperatoreForm = this.#fb.group({
    username: [
      '',
      {
        validators: [Validators.required, Validators.minLength(3)],
        asyncValidators: [usernameDisponibileValidator(this.staffManager)],
      },
    ],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: ['' as RoleCode | '', [Validators.required]],
  });

  ngOnInit() {
    this.staffManager.fetchStaff();
  }

  checkFormControl(control: string) {
    const fc = this.nuovoOperatoreForm.get(control);
    return fc?.invalid && (fc.touched || fc.dirty);
  }

  checkFormControlError(control: string, err: string) {
    const fc = this.nuovoOperatoreForm.get(control);
    return fc && fc.hasError(err) ? fc.getError(err) : null;
  }

  onSubmit() {
    if (this.nuovoOperatoreForm.valid) {
      const { username, password, role } = this.nuovoOperatoreForm.getRawValue();
      this.staffManager.createStaff({
        username: username!,
        password: password!,
        role: role as RoleCode,
      });
      this.nuovoOperatoreForm.reset({ username: '', password: '', role: '' });
    } else {
      this.nuovoOperatoreForm.markAllAsTouched();
    }
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