import { Routes } from '@angular/router';
import { Accounts } from './features/accounts/accounts';
import { Home } from './features/home/home';
import { Transactions } from './features/transactions/transactions';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => Home,
  },
  {
    path: 'transactions',
    loadComponent: () => Transactions,
  },
  {
    path: 'transactions/:month',
    loadComponent: () => Transactions,
  },
  {
    path: 'accounts',
    loadComponent: () => Accounts,
  },
];
