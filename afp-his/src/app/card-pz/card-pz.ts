import { Component,signal } from '@angular/core';
import { CardModule } from 'primeng/card';
import { Button } from "primeng/button";


interface Paziente{
  id: string;
  nome: string;
  cognome: string;
  braccialetto: string;
  eta: number;
  codiceColore: string;
  note: string;
  patologia: string;
}
@Component({
  selector: 'his-card-pz',
  imports: [CardModule, Button],
  templateUrl: './card-pz.html',
  styleUrl: './card-pz.scss',
})
export class CardPz {
  nome:string="Emmanuele"; //notazione vecchia
  paziente = signal<Paziente>({
    id: "1",
    nome: "Gigi",
    cognome: "Rossi",
    braccialetto: "123456",
    eta: 75,
    codiceColore: "rosso",
    note: "Nessuna nota",
    patologia: "Diabete"
  }); //notazione nuova

  cambiaNome(): void{
    this.nome = "Mario";
    this.paziente.set({ 
      id: "1",
      nome: "Mario",
      cognome: "Rossi",
      braccialetto: "123456",
      eta: 33,
      codiceColore: "blu",
      note: "Nessuna nota",
      patologia: "Diabete"
    });
  }
}
