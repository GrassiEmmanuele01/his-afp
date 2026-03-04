import { Component, signal } from '@angular/core';
import { Button } from 'primeng/button';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [Button, RouterModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('his-afp');
}
