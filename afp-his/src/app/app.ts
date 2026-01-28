import { Component, signal } from '@angular/core';
import { DarkmodeSelector } from './darkmode-selector/darkmode-selector';
import { CardPz } from "./card-pz/card-pz";

@Component({
  selector: 'app-root',
  imports: [DarkmodeSelector, CardPz],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('afp-his');
}
