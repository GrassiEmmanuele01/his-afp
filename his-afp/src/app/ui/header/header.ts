import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Button } from 'primeng/button';
import { RouterLink} from '@angular/router';
import { DarkmodeSelector } from '../darkmode-selector/darkmode-selector.component';
import { DividerModule } from 'primeng/divider';
import { environment } from '../../../environments/environment.development';

@Component({
  selector: 'his-header',
  imports: [ Button,RouterLink,DarkmodeSelector,DividerModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {
  reparto = environment.reparto;
  struttura = environment.struttura;

}
