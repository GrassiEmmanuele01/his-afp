import { Component, signal } from '@angular/core';
// import { DarkmodeSelector } from './ui/darkmode-selector/darkmode-selector.component';
// import { Button } from "primeng/button";
import { RouterModule} from "@angular/router";
import { Header } from "./ui/header/header";

@Component({
  selector: 'app-root',
  imports: [Header,RouterModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('his-afp');
}
