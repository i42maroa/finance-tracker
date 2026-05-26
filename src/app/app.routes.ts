import { Routes } from '@angular/router';
import { Transactions } from './features/transactions/transactions';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'transactions',
  },
  {
    path: 'transactions',
    loadComponent: () => Transactions
  },
];
