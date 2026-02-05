import { Component, signal } from '@angular/core';
import { CardPZ, Paziente} from '../card-pz/card-pz';

@Component({
  selector: 'his-lista-pz',
  imports: [CardPZ],
  templateUrl: './lista-pz.html',
  styleUrl: './lista-pz.scss',
})
export class ListaPz {
  listaPz = signal<Paziente[]>([
    {
      id: "1",
    nome: "Gigi",
    cognome: "Rossi",
    braccialetto: "123",
    eta: 75,
    codiceColore: "rosso",
    note: "Nessuna nota",
    patologia: "Diabete"
    },
    {
      id: "2",
    nome: "Valerio",
    cognome: "Gravili",
    braccialetto: "456",
    eta: 23,
    codiceColore: "Rosso",
    note: "Sono sopravvissuto a un Buster Call",
    patologia: "Trauma cranico"
    }
  ]);
}
