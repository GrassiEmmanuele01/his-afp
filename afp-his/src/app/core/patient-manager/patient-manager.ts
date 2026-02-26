import { inject, Injectable, signal } from '@angular/core';
import { Paziente, PazienteDTO } from './patient.model';
import { HttpClient } from '@angular/common/http';
import { APIResponse } from '../models/APIResponse.model';

@Injectable({
  providedIn: 'root'
})
export class PatientManager {
  #http = inject(HttpClient);
  #listaPZ = signal<Paziente[]>([]);
  listaPZ = this.#listaPZ.asReadonly();

  constructor() {
    this.fetchPazienti();
  }

  public fetchPazienti() {
    this.#http.get<APIResponse<PazienteDTO[]>>("http://localhost:3000/admissions")
      .subscribe(
      {
          next: (res) => {
            const pazienti = res.data.map(dto => this.mapPazienteDTOToPaziente(dto));
            this.#listaPZ.set(pazienti);
        },
          error: (err) => { 
          console.error('Errore nel recupero dei pazienti:', err);
        }
      }
    );
  }

  public mapPazienteDTOToPaziente(dto: PazienteDTO): Paziente {
    return {
      id: dto.id.toString(),
      nome: dto.nome,
      cognome: dto.cognome,
      braccialetto: dto.braccialetto,
      eta: this.calcolaEta(dto.dataNascita),
      codiceColore: dto.coloreCode,
      note: dto.noteTriage,
      patologia: dto.patologiaCode
    };

  }
  public calcolaEta(dataNascita: string): number {
    const birthDate = new Date(dataNascita);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }
}


