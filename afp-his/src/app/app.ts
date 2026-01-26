import { Component, signal } from '@angular/core';
import { DarkmodeSelector } from './darkmode-selector/darkmode-selector';

@Component({
  selector: 'app-root',
  imports: [DarkmodeSelector],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('afp-his');
}
