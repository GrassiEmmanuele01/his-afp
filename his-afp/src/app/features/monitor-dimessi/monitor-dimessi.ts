import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { httpResource } from '@angular/common/http';
import { Fieldset } from 'primeng/fieldset';
import { APIResponse } from '../../core/models/APIResponse.model';
import { DischargedPatient } from '../../core/Pazienti/DischargedPatient.model';

type SortDirection = 'asc' | 'desc';

@Component({
  selector: 'his-monitor-dimessi',
  imports: [DatePipe, Fieldset],
  templateUrl: './monitor-dimessi.html',
  styleUrl: './monitor-dimessi.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MonitorDimessi {
  dimessiReq = httpResource<APIResponse<DischargedPatient[]>>(
    () => '/api/admissions/reports/discharged',
  );

  sortDirection = signal<SortDirection>('desc');

  dimessiOrdinati = computed(() => {
    const pazienti = this.dimessiReq.value()?.data ?? [];
    const direzione = this.sortDirection();

    return [...pazienti].sort((a, b) => {
      const dataA = new Date(a.dataOraDimissione).getTime();
      const dataB = new Date(b.dataOraDimissione).getTime();
      return direzione === 'asc' ? dataA - dataB : dataB - dataA;
    });
  });

  toggleOrdinamento() {
    this.sortDirection.update((direzione) => (direzione === 'asc' ? 'desc' : 'asc'));
  }
}