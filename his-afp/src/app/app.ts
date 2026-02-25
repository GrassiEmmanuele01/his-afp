import { Component, signal } from '@angular/core';
import { DarkmodeSelector } from './darkmode-selector/darkmode-selector.component';
import { ListaPz } from './lista-pz/lista-pz';

@Component({
  selector: 'app-root',
  imports: [DarkmodeSelector, ListaPz],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('his-afp');
}
