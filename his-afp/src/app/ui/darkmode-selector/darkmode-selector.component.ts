import { Component, signal} from '@angular/core';
import { ButtonModule } from 'primeng/button';

const DARK_MODE_KEY = 'darkMode';

@Component({
  selector: 'his-darkmode-selector',
  imports: [ButtonModule],
  templateUrl: './darkmode-selector.component.html',
  styleUrl: './darkmode-selector.component.scss',
})
export class DarkmodeSelector {
  isDark = signal<boolean>(false);
  private readonly mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  constructor() {
    this.initDarkMode();
    this.listenSystemChanges();
  }

  private initDarkMode() {
    const savedDarkMode = localStorage.getItem(DARK_MODE_KEY);
    if (savedDarkMode !== null) {
      const isDarkMode = JSON.parse(savedDarkMode);
      this.isDark.set(isDarkMode);
      this.applyTheme(isDarkMode);
      return;
    }

    const systemDark = this.mediaQuery.matches;
    this.isDark.set(systemDark);
    this.applyTheme(systemDark);
  }

  private listenSystemChanges() {
    this.mediaQuery.addEventListener('change', (event) => {
      if (!localStorage.getItem(DARK_MODE_KEY)) {
        this.isDark.set(event.matches);
        this.applyTheme(event.matches);
      }
    });
  }

  private applyTheme(isDark: boolean) {
    const element = document.querySelector('html');
    element?.classList.toggle('my-app-dark', isDark);
  }

  toggleDarkMode() {
    this.isDark.update((current) => {
      const newValue = !current;
      localStorage.setItem(DARK_MODE_KEY, JSON.stringify(newValue));
      this.applyTheme(newValue);
      return newValue;
    });
  }

  get icon(): string {
    return this.isDark() ? 'pi pi-sun' : 'pi pi-moon';
  }
}
