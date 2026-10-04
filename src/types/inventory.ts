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
    asking_price: number;
    date_added: string;
}