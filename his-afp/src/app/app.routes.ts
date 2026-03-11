import { Routes } from '@angular/router';
import { ModificaPz } from './features/modifica-pz/modifica-pz';

export const routes: Routes = [
  {
    path: 'lista-pz',
    // component: ListaPz,
    loadComponent: () =>
      import('./features/lista-pz/lista-pz').then((l)=>l.ListaPz)
  },
  {
    path: 'accettazione-pz',
    // component: AccettazionePz,
    loadComponent: () =>
      import('./features/accettazione-pz/accettazione-pz').then((a)=>a.AccettazionePz)
  },
  {
    path: 'modifica-pz',
    //component: ModificaPz,
    loadComponent: () =>
      import('./features/modifica-pz/modifica-pz').then((m)=>m.ModificaPz)
  },
  {
    path: 'modifica-pz:patientId',
    component: ModificaPz,
  },
  {
    path: 'stato-servizi',
    loadComponent: () =>
      import('./features/stato-servizi/stato-servizi').then((m) => m.StatoServizi),
  },
  {
    path: '',
    redirectTo: 'lista-pz',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'lista-pz',
    pathMatch: 'full',
  },
];
