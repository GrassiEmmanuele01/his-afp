import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { APIResponse } from '../models/APIResponse.model';
import {
  CreateStaffPayload,
  CreateStaffResponse,
  RoleCode,
  Staff,
  UsernameAvailability,
} from './Staff.model';

@Injectable({
  providedIn: 'root',
})
export class StaffManager {
  #http = inject(HttpClient);
  #listaStaff = signal<Staff[]>([]);
  listaStaff = this.#listaStaff.asReadonly();

  public fetchStaff() {
    this.#http.get<APIResponse<Staff[]>>('/api/users').subscribe({
      next: (res) => {
        this.#listaStaff.set(res.data);
      },
      error: (err) => {
        console.error('Errore durante il fetch degli operatori:', err);
      },
    });
  }

  public checkUsernameDisponibile(username: string): Observable<boolean> {
    return this.#http
      .get<APIResponse<UsernameAvailability>>(`/api/users/check/${username}`)
      .pipe(map((res) => res.data.available));
  }

  public createStaff(payload: CreateStaffPayload) {
    this.#http.post<APIResponse<CreateStaffResponse>>('/api/users', payload).subscribe({
      next: () => {
        this.fetchStaff();
      },
      error: (err) => {
        console.error("Errore durante la creazione dell'operatore:", err);
      },
    });
  }

  public editRole(id: number, role: RoleCode) {
    this.#http.patch<APIResponse<Staff>>(`/api/users/${id}/editrole`, { role }).subscribe({
      next: () => {
        this.fetchStaff();
      },
      error: (err) => {
        console.error("Errore durante la modifica del ruolo dell'operatore:", err);
      },
    });
  }

  public setActiveState(staff: Staff) {
    const action = staff.isActive ? 'deactivate' : 'activate';
    this.#http.patch<APIResponse<null>>(`/api/users/${staff.id}/${action}`, {}).subscribe({
      next: () => {
        this.fetchStaff();
      },
      error: (err) => {
        console.error("Errore durante l'aggiornamento dello stato dell'operatore:", err);
      },
    });
  }
}