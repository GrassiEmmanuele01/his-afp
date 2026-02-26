import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SystemStatus } from '../../core/SystemStatus/system-status';
import { Tag} from 'primeng/tag';
import { Button } from 'primeng/button';

@Component({
  selector: 'his-stato-api',
  imports: [Tag, Button],
  templateUrl: './statoAPI.html',
  styleUrl: './statoAPI.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatoAPI {
  readonly SystemStatus = inject(SystemStatus);
}