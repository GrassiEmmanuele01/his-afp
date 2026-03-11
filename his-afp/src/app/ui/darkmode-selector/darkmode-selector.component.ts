import { Component, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'his-darkmode-selector',
  imports: [ButtonModule],
  templateUrl: './darkmode-selector.component.html',
  styleUrl: './darkmode-selector.component.scss',
})

export class DarkmodeSelector {
  isDark = signal<boolean>(false);

  // getter che calcola l'icona in base allo stato
  get icon(): string {
    return this.isDark() ? 'pi pi-moon' : 'pi pi-sun';
  }

  toggleDarkMode() {
    const element = document.querySelector('html');
    element?.classList.toggle('my-app-dark');
    this.isDark.update((current) => !current);
  }
}
