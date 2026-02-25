import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SystemStatus } from '../../core/SystemStatus/system-status';
import { Tag} from 'primeng/tag';

@Component({
  selector: 'his-stato-api',
  imports: [Tag],
  templateUrl: './statoAPI.html',
  styleUrl: './statoAPI.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatoAPI {
    healthStatus = inject(SystemStatus).statoAPI;
 }
