import { Transaction } from '../models/transaction.model';

export const mockTransactions: Transaction[] = [
  {
    id: 'tx-demo-1',
    householdId: 'hh-main',
    type: 'expense',
    amountCents: 1245,
    date: '2026-05-27',
    category: 'Comida',
    description: 'Menu del dia',
    notes: 'Movimiento de ejemplo',
  },
  {
    id: 'tx-demo-2',
    householdId: 'hh-personal',
    type: 'income',
    amountCents: 250000,
    date: '2026-05-27',
    category: 'Nomina',
    description: 'Ingreso mensual',
  },
];
