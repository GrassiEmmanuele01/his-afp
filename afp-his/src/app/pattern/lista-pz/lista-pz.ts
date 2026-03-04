import { Component, signal ,model, computed, inject, effect} from '@angular/core';
import { CardPZ } from '../card-pz/card-pz';
import { Paziente } from '../core/patient-manager/patient.model';
import { InputTextModule } from 'primeng/inputtext';
import {FormsModule} from "@angular/forms";
import { Button } from "primeng/button";
import { HttpClient } from '@angular/common/http';
import { HealthStatus } from '../core/SystemStatus/HealthStatus.model';
import { StatoAPI } from '../ui/statoAPI/statoAPI';
import { PatientManager } from '../core/patient-manager/patient-manager';


interface Response {
  status: string;
  data: HealthStatus;
}
@Component({
  selector: 'his-lista-pz',
  imports: [CardPZ, InputTextModule, FormsModule, Button,StatoAPI],
  templateUrl: './lista-pz.html',
  styleUrl: './lista-pz.scss',
})
export class ListaPz {
  readonly PatientManager = inject(PatientManager);
  nomePaziente = model<string>('');
  listaPz = this.PatientManager.listaPZ;

  editNomePaziente(nomePz:string) { 
    this.nomePaziente.set(nomePz);
    this.PatientManager.filterByName(nomePz);
  }

  readonly #http = inject(HttpClient);
  getHealthStatus() { 
    this.#http.get<Response>("http://localhost:3000/health").subscribe(
      (res) => {  
    //    this.healthStatus.set(res.data);
      //  console.table('DB status:', res.data.database) 
      }
    );
  }

  constructor() { 
    effect(() => { 
      this.PatientManager.filterByName(this.nomePaziente());
    });

  }
}
