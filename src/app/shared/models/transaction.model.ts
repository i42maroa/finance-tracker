export type TransactionType = 'expense' | 'income';

export interface TransactionFilters {
  dateFrom?: string;
  dateTo?: string;
  category?: string;
  householdId?: string;
  name?: string;
  type?: TransactionType;
}

export interface TransactionPageQuery {
  filters?: TransactionFilters;
  page: number;
  pageSize: number;
}

export interface TransactionPage {
  items: Transaction[];
  total: number;
  page: number;
  pageSize: number;
}

export interface TransactionSummary {
  incomeCents: number;
  expenseCents: number;
  balanceCents: number;
}

export interface Transaction {
  id: string;
  householdId: string;
  type: TransactionType;
  amountCents: number;
  date: string;
  category: string;
  description: string;
  notes?: string;
}

export interface TransactionView extends Transaction {
  householdName: string;
}

export type TransactionDraft = Omit<Transaction, 'id'>;
