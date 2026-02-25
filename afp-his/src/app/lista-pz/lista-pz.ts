import { Component, signal ,model, computed, inject} from '@angular/core';
import { CardPZ, Paziente } from '../card-pz/card-pz';
import { InputTextModule } from 'primeng/inputtext';
import {FormsModule} from "@angular/forms";
import { Button } from "primeng/button";
import { HttpClient } from '@angular/common/http';
import { HealthStatus } from '../core/SystemStatus/HealthStatus.model';
import { StatoAPI } from '../ui/statoAPI/statoAPI';

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
  nomePaziente = model<string>('');
  listaPz = signal<Paziente[]>([
    {
      id: "1",
      nome: "Gigi",
      cognome: "Rossi",
      braccialetto: "123",
      eta: 75,
      codiceColore: "ROSSO",
      note: "Nessuna nota",
      patologia: "Diabete"
    },
    {
      id: "2",
      nome: "Valerio",
      cognome: "Gravili",
      braccialetto: "456",
      eta: 23,
      codiceColore: "GIALLO",
      note: "Sono sopravvissuto a un Buster Call",
      patologia: "Trauma cranico"
    }
  ]);


  filteredList = computed(() => { 
    return this.listaPz().filter((pz: Paziente) =>
      pz.nome.toLowerCase().includes(this.nomePaziente().toLowerCase()));
  })



  editNomePaziente(nomePz:string) { 
    this.nomePaziente.set(nomePz);
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
}
