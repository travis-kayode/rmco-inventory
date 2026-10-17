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