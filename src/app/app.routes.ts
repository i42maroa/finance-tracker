import { Routes } from '@angular/router';
import { Accounts } from './features/accounts/accounts';
import { Home } from './features/home/home';
import { Transactions } from './features/transactions/transactions';
import { NavItem } from './shared/models/navigation.model';

export const appNavItems: NavItem[] = [
  { label: 'Inicio', route: '/', exact: true },
  { label: 'Perfil', route: '/accounts', exact: false },
];

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
