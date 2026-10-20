export type Condition = 'DS' | 'Used';

export type Product = {
  id: number;
  brand: string;
  name: string;
  colourway: string;
};

export type InventoryItem = {
  id: number;
  product_id: number;
  size: string;
  condition: Condition;
  location: string;
  cost: number;
  asking_price: number | null;
  date_added: string;
}

export type Sale = {
  id: number;
  sale_price: number;
  sold_date: string;
  inventory_items: {
    id: number;
    size: string;
    condition: 'DS' | 'Used';
    cost: number;
    products: {
      brand: string;
      name: string;
      colourway: string;
    };
  };
};

export type SaleTransactionStatus =
  | 'draft'
  | 'pending'
  | 'completed'
  | 'cancelled';

export type SaleTransaction = {
  id: number;
  status: SaleTransactionStatus;
  customer_id: number | null;
  notes: string | null;
  completed_at: string | null;
};

export type SaleItem = {
  id: number;
  sale_transaction_id: number;
  inventory_item_id: number | null;
  sourcing_request_id: number | null;
  sale_price: number;
  cost_snapshot: number | null;
};

export type CompletedSaleItem = SaleItem & {
  sale_transactions: {
    completed_at: string;
  };
  inventory_items: {
    id: number;
    size: string;
    condition: Condition;
    products: {
      brand: string;
      name: string;
      colourway: string;
    };
  } | null;
};

export type SalesHistoryItem = {
  id: string;
  transactionId: number | null;

  brand: string;
  name: string;
  colourway: string;
  size: string | null;
  condition: Condition | null;

  salePrice: number;
  cost: number;
  soldDate: string;

  source: 'legacy' | 'transaction';
};