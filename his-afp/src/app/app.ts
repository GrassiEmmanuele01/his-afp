import { Component, signal } from '@angular/core';
import { DarkmodeSelector } from './ui/darkmode-selector/darkmode-selector.component';
import { Button } from "primeng/button";
import { RouterLink, RouterModule } from "@angular/router";

@Component({
  selector: 'app-root',
  imports: [DarkmodeSelector,Button, RouterLink, RouterModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('his-afp');
}
