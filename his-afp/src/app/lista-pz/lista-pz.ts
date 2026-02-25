import { Component, computed, inject, model, signal } from '@angular/core';
import { CardPz, Paziente } from '../card-pz/card-pz';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { catchError, of } from 'rxjs';

interface Response<T> {
  status: string;
  data: T;
}

interface HealthStatus {
  service: string;
  database: string;
  uptime: number;
}

@Component({
  selector: 'his-lista-pz',
  imports: [InputTextModule, FormsModule, ButtonModule, CardPz, TagModule],
  templateUrl: './lista-pz.html',
  styleUrl: './lista-pz.scss',
})
export class ListaPz {
  nomePaziente = model<string>('');
  listaPz = signal<Paziente[]>([
    {
      braccialetto: 'PR234',
      codiceColore: 'VERDE',
      cognome: 'Rocchio',
      eta: 25,
      id: '23',
      nome: 'Pietro',
      note: 'TRauma',
      patologia: 'C19',
    },
    {
      braccialetto: 'BR0034',
      codiceColore: 'ARANCIONE',
      cognome: 'Brazorf',
      eta: 25,
      id: '1',
      nome: 'Ajeje',
      note: 'TRauma',
      patologia: 'C19',
    },
    {
      braccialetto: 'LSD',
      codiceColore: 'ROSSO',
      cognome: 'Winky',
      eta: 25,
      id: '1',
      nome: 'Tinky',
      note: 'TRauma',
      patologia: 'C19',
    },
    {
      braccialetto: 'LSD',
      codiceColore: 'AZZURRO',
      cognome: 'Winky',
      eta: 25,
      id: '1',
      nome: 'Tinky',
      note: 'TRauma',
      patologia: 'C19',
    },
    {
      braccialetto: 'LSD',
      codiceColore: 'AZZURRO',
      cognome: 'Winky',
      eta: 25,
      id: '1',
      nome: 'Tinky',
      note: 'TRauma',
      patologia: 'C19',
    },
  ]);

  healthStatus = signal<HealthStatus | null>(null);

  filteredList = computed(() => {
    return this.listaPz().filter((pz: Paziente) =>
      pz.nome.toLowerCase().includes(this.nomePaziente().toLowerCase()),
    );
  });
  readonly #http = inject(HttpClient);

  constructor() {
    this.getHealthStatus();
  }

  editNomePaziente(nomePZ: string) {
    this.nomePaziente.set(nomePZ);
  }

  getHealthStatus() {
    this.#http
      .get<Response<HealthStatus>>('http://localhost:3000/health')
      .pipe(
        catchError((error) => {
          // TODO: Non lo abbiamo visto a lezione
          console.error('Error fetching health status:', error.error.data);
          return of(error.error as Response<HealthStatus>); // Return the error response as an observable to keep the stream alive
        }),
      )
      .subscribe((res) => {
        console.table(res);
        console.log('DB status:', res.data.database);

        this.healthStatus.set(res?.data);
      });
  }
}
